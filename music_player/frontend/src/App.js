import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// If running 'npm start' (Development), it uses localhost:5000
// If running via Flask (Production), it uses the current domain (relative path)
const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';

function App() {
  // --- Data State ---
  const [allSongs, setAllSongs] = useState([]); 
  const [displayedSongs, setDisplayedSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // --- Library State ---
  const [playlists, setPlaylists] = useState({ "Favorites": [] }); 
  const [recentlyPlayed, setRecentlyPlayed] = useState([]); 
  const [activePlaylistName, setActivePlaylistName] = useState('All Songs');
  const [songEdits, setSongEdits] = useState({}); 

  // --- UI State ---
  const [editModalData, setEditModalData] = useState(null); 
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); 
  const [isDragActive, setIsDragActive] = useState(false); 

  // --- Playback State ---
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [prevVolume, setPrevVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); 
  const [sleepTimer, setSleepTimer] = useState(null); 
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState(null);

  // --- Filter State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // --- Refs ---
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null); 
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // --- 1. HELPER FUNCTIONS ---

  const getAssetUrl = useCallback((path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    return `${API_BASE_URL}${path}`;
  }, []);

  const getDisplaySong = useCallback((song) => {
    return songEdits[song.id] ? { ...song, ...songEdits[song.id] } : song;
  }, [songEdits]);

  const initVisualizer = useCallback(() => {
    if (!audioContextRef.current && audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256; 
      
      try {
        if (!sourceRef.current) {
            sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);
        }
        
        const drawVisualizer = () => {
          if (!canvasRef.current || !analyserRef.current) return;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const renderFrame = () => {
            animationRef.current = requestAnimationFrame(renderFrame);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              barHeight = dataArray[i] / 2; 
              const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
              gradient.addColorStop(0, '#1db954'); 
              gradient.addColorStop(1, '#1ed760'); 
              
              ctx.fillStyle = gradient;
              ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
              x += barWidth + 1;
            }
          };
          renderFrame();
        };
        drawVisualizer();

      } catch (e) { console.warn("Visualizer Source Error", e); }
    } else if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const playAudio = useCallback(() => {
    if(audioRef.current) {
      initVisualizer(); 
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => { if(e.name !== 'AbortError') console.error(e); });
      }
    }
  }, [initVisualizer]);

  const playSong = useCallback((song) => {
    setRecentlyPlayed(prev => [song.id, ...prev.filter(id => id !== song.id)].slice(0, 20));
    setCurrentSong(getDisplaySong(song));
    setIsPlaying(true);
  }, [getDisplaySong]);

  const skipNext = useCallback((isAuto = false) => {
    if (displayedSongs.length === 0) return;

    if (repeatMode === 'one' && isAuto) { 
      audioRef.current.currentTime = 0; 
      playAudio(); 
      return; 
    }

    const currIdx = displayedSongs.findIndex(s => s.id === currentSong?.id);
    let nextIdx;

    if (isShuffle) {
      if (displayedSongs.length === 1) nextIdx = 0;
      else do { nextIdx = Math.floor(Math.random() * displayedSongs.length); } while (nextIdx === currIdx);
    } else {
      nextIdx = currIdx + 1;
      
      if (nextIdx >= displayedSongs.length) { 
        if (repeatMode === 'all') nextIdx = 0; 
        else if (isAuto) return; 
        else nextIdx = 0; 
      }
    }
    playSong(displayedSongs[nextIdx]);
  }, [displayedSongs, currentSong, isShuffle, repeatMode, playSong, playAudio]);

  const togglePlay = useCallback(() => {
    if (isPlaying) { 
      audioRef.current?.pause(); 
      setIsPlaying(false); 
    } else { 
      setIsPlaying(true); 
    }
  }, [isPlaying]);

  const handleVolume = useCallback((e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if(audioRef.current) audioRef.current.volume = val;
    setIsMuted(val === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) { 
      setVolume(prevVolume); 
      if(audioRef.current) audioRef.current.volume = prevVolume; 
      setIsMuted(false); 
    } else { 
      setPrevVolume(volume); 
      setVolume(0); 
      if(audioRef.current) audioRef.current.volume = 0; 
      setIsMuted(true); 
    }
  }, [isMuted, prevVolume, volume]);

  const skipPrev = useCallback(() => {
    if (audioRef.current.currentTime > 3) { audioRef.current.currentTime = 0; return; }
    const currIdx = displayedSongs.findIndex(s => s.id === currentSong?.id);
    const prevIdx = (currIdx - 1 + displayedSongs.length) % displayedSongs.length;
    playSong(displayedSongs[prevIdx]);
  }, [displayedSongs, currentSong, playSong]);

  // --- 2. EFFECTS ---

  useEffect(() => {
    const savedPlaylists = localStorage.getItem('my_playlists');
    const savedRecents = localStorage.getItem('my_recents');
    const savedEdits = localStorage.getItem('my_edits');
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
    if (savedRecents) setRecentlyPlayed(JSON.parse(savedRecents));
    if (savedEdits) setSongEdits(JSON.parse(savedEdits));
    fetchMusic();

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return; 
      switch(e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': if(audioRef.current) audioRef.current.currentTime += 5; break;
        case 'ArrowLeft': if(audioRef.current) audioRef.current.currentTime -= 5; break;
        case 'ArrowUp': e.preventDefault(); handleVolume({target: {value: Math.min(volume + 0.05, 1)}}); break;
        case 'ArrowDown': e.preventDefault(); handleVolume({target: {value: Math.max(volume - 0.05, 0)}}); break;
        case 'KeyM': toggleMute(); break;
        case 'KeyS': setIsShuffle(prev => !prev); break;
        case 'KeyR': setRepeatMode(m => m==='none'?'all':(m==='all'?'one':'none')); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, togglePlay, toggleMute, handleVolume]); 

  useEffect(() => { localStorage.setItem('my_playlists', JSON.stringify(playlists)); }, [playlists]);
  useEffect(() => { localStorage.setItem('my_recents', JSON.stringify(recentlyPlayed)); }, [recentlyPlayed]);
  useEffect(() => { localStorage.setItem('my_edits', JSON.stringify(songEdits)); }, [songEdits]);

  useEffect(() => { if (isPlaying && currentSong) playAudio(); }, [currentSong, isPlaying, playAudio]);

  useEffect(() => {
    let sourceList = [];
    if (activePlaylistName === 'All Songs') sourceList = allSongs;
    else if (activePlaylistName === 'Recently Played') sourceList = recentlyPlayed.map(id => allSongs.find(s => s.id === id)).filter(Boolean);
    else sourceList = allSongs.filter(s => (playlists[activePlaylistName] || []).includes(s.id));

    const filtered = sourceList.map(getDisplaySong).filter(song => {
      const q = searchQuery.toLowerCase();
      return (song.title.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q)) &&
             (selectedCategory === '' || song.category === selectedCategory);
    });
    setDisplayedSongs(filtered);
  }, [allSongs, playlists, recentlyPlayed, activePlaylistName, searchQuery, selectedCategory, getDisplaySong]);

  // --- 3. OTHER LOGIC ---

  const fetchMusic = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/music`);
      const data = await res.json();
      setAllSongs(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const newServerSongs = data.filter(s => !existingIds.has(s.id));
        return [...prev, ...newServerSongs];
      });
      const cats = [...new Set(data.map(s => s.category))];
      setCategories(cats);
    } catch (err) { console.error("Backend offline", err); }
  };

  const processFiles = async (files) => {
    const newLocalSongs = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/')) {
        newLocalSongs.push({
          id: `local_${Date.now()}_${i}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Local Drop",
          category: "Imported",
          album: "Drag & Drop",
          duration: "--:--",
          url: URL.createObjectURL(file),
          cover: null,
          isLocal: true
        });
      }
    }
    if (newLocalSongs.length > 0) setAllSongs(prev => [...prev, ...newLocalSongs]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragActive(true); };
  const handleDragLeave = () => setIsDragActive(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    processFiles(e.dataTransfer.files);
  };

  const setTimer = (minutes) => {
    if (sleepTimer) clearTimeout(sleepTimer);
    if (minutes === 0) { setSleepTimer(null); setSleepTimeRemaining(null); return; }
    setSleepTimeRemaining(minutes);
    const id = setTimeout(() => {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      setSleepTimer(null);
      setSleepTimeRemaining(null);
      alert("Sleep Timer: Music Paused 🌙");
    }, minutes * 60 * 1000);
    setSleepTimer(id);
  };

  const handleContextMenu = (e, song) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, song });
  };
  const closeContextMenu = () => setContextMenu(null);
  
  const createPlaylist = () => { if (!newPlaylistName.trim() || playlists[newPlaylistName]) return; setPlaylists(prev => ({ ...prev, [newPlaylistName]: [] })); setNewPlaylistName(''); setShowModal(false); };
  const addToPlaylist = (id, name) => { setPlaylists(prev => { const list = prev[name] || []; if (list.includes(id)) return prev; return { ...prev, [name]: [...list, id] }; }); };
  const formatTime = (t) => { if (!t || isNaN(t)) return "0:00"; const m = Math.floor(t / 60); const s = Math.floor(t % 60); return `${m}:${s < 10 ? '0' : ''}${s}`; };

  const saveEdit = () => {
    if (!editModalData) return;
    setSongEdits(prev => ({
      ...prev,
      [editModalData.id]: {
        title: editModalData.title || "Unknown Title",
        artist: editModalData.artist || "Unknown Artist",
        album: editModalData.album || "Unknown Album"
      }
    }));
    if (currentSong && currentSong.id === editModalData.id) {
       setCurrentSong(prev => ({ ...prev, ...editModalData }));
    }
    setEditModalData(null);
  };

  return (
    <div className="App" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={closeContextMenu}>
      {isDragActive && <div className="drag-overlay"><h1>📂 Drop Music Here to Import</h1></div>}
      
      <header className="App-header">
        <h1>Music App Pro</h1>
        <div className="header-extras">
           {sleepTimeRemaining && <span style={{marginRight:'10px', fontSize:'0.9rem', color:'#1db954'}}>🌙 {sleepTimeRemaining}m</span>}
           <select onChange={(e) => setTimer(parseInt(e.target.value))} className="sleep-timer-select">
             <option value="0">🌙 Sleep Timer: Off</option>
             <option value="15">15 Minutes</option>
             <option value="30">30 Minutes</option>
             <option value="60">1 Hour</option>
           </select>
        </div>
      </header>

      <main className="main-layout">
        <div className="player-section">
          {currentSong ? (
            <div className="now-playing-card">
              <div className="album-art">
                {currentSong.cover ? (
                  <img 
                    src={getAssetUrl(currentSong.cover)} 
                    alt="Art" 
                    onError={(e)=>{
                        e.target.style.display='none'; 
                        e.target.nextSibling.style.display='flex';
                    }} 
                  />
                ) : null}
                
                {/* DIRECT STRING PATH */}
                <img 
                    src="/default-cover.jpg"
                    alt="Default Art"
                    className="default-art" 
                    style={{
                        display: currentSong.cover ? 'none' : 'block',
                        width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'
                    }}
                />
                
                <canvas ref={canvasRef} width="300" height="80" className="visualizer-canvas"></canvas>
              </div>

              <div className="song-info">
                <h2>{currentSong.title}</h2>
                <p>{currentSong.artist}</p>
              </div>
              <div className="progress-bar-wrapper">
                <span>{formatTime(currentTime)}</span>
                <input type="range" min="0" max={duration || 0} value={currentTime} onChange={(e) => { audioRef.current.currentTime = e.target.value; setCurrentTime(e.target.value); }} />
                <span>{formatTime(duration)}</span>
              </div>
              <div className="controls-row">
                <button className={`btn-icon ${isShuffle ? 'active' : ''}`} onClick={() => setIsShuffle(!isShuffle)} title="Shuffle (S)">🔀</button>
                <button className="btn-icon" onClick={skipPrev} title="Previous (Left Arrow)">⏮</button>
                <button className="btn-play" onClick={togglePlay} title="Spacebar">{isPlaying ? '⏸' : '▶'}</button>
                <button className="btn-icon" onClick={() => skipNext(false)} title="Next (Right Arrow)">⏭</button>
                <button className={`btn-icon ${repeatMode !== 'none' ? 'active' : ''}`} onClick={() => setRepeatMode(m => m==='none'?'all':(m==='all'?'one':'none'))} title="Repeat (R)">{repeatMode === 'one' ? '🔂' : '🔁'}</button>
              </div>
              <div className="volume-row">
                <button onClick={toggleMute} className="btn-mute" title="Mute (M)">{isMuted ? '🔇' : '🔊'}</button>
                <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolume} title="Volume (Up/Down Arrow)" />
              </div>
              <audio 
                ref={audioRef} 
                crossOrigin="anonymous" 
                src={getAssetUrl(currentSong.url)} 
                onTimeUpdate={() => { setCurrentTime(audioRef.current.currentTime); setDuration(audioRef.current.duration); }} 
                onEnded={() => skipNext(true)} 
              />
            </div>
          ) : (
            <div className="now-playing-card empty-state">
              {/* DIRECT STRING PATH */}
              <img 
                src="/default-cover.jpg"
                alt="Music Note" 
                style={{
                  width: '60%', 
                  maxWidth: '200px', 
                  borderRadius: '12px', 
                  marginBottom: '20px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }} 
              />
              <h3>Drag & Drop Files Here</h3>
            </div>
          )}
        </div>

        <div className="library-section">
          <div className="playlist-bar">
            <button className={activePlaylistName === 'All Songs' ? 'pl-tab active' : 'pl-tab'} onClick={() => setActivePlaylistName('All Songs')}>All</button>
            <button className={activePlaylistName === 'Recently Played' ? 'pl-tab active' : 'pl-tab'} onClick={() => setActivePlaylistName('Recently Played')}>Recent</button>
            {Object.keys(playlists).map(name => (
              <div key={name} className="pl-tab-wrapper">
                <button className={activePlaylistName === name ? 'pl-tab active' : 'pl-tab'} onClick={() => setActivePlaylistName(name)}>{name}</button>
              </div>
            ))}
            <button className="pl-tab new" onClick={() => setShowModal(true)}>+</button>
          </div>

          <div className="search-bar">
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">Genres</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="file" ref={fileInputRef} webkitdirectory="true" directory="true" multiple style={{ display: 'none' }} onChange={(e) => processFiles(e.target.files)} />
            <button className="btn-import" onClick={() => fileInputRef.current.click()}>📂 Scan</button>
          </div>

          <div className="song-list">
            <ul>
              {displayedSongs.map(song => (
                <li 
                  key={song.id} 
                  className={currentSong?.id === song.id ? 'active' : ''} 
                  onClick={() => playSong(song)}
                  onContextMenu={(e) => handleContextMenu(e, song)}
                >
                  <div className="song-details">
                    <span className="title">{song.title}</span>
                    <span className="artist">{song.artist}</span>
                  </div>
                  <div className="list-controls">
                    <button className="btn-edit" onClick={(e) => { e.stopPropagation(); setEditModalData(getDisplaySong(song)); }}>✎</button>
                    <button className={`btn-fav ${playlists['Favorites'].includes(song.id) ? 'liked' : ''}`} onClick={(e) => { e.stopPropagation(); if(playlists['Favorites'].includes(song.id)){ setPlaylists(p=>({...p, 'Favorites':p['Favorites'].filter(x=>x!==song.id)})) } else { addToPlaylist(song.id, 'Favorites'); } }}>❤</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* CONTEXT MENU */}
      {contextMenu && (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <div onClick={() => { addToPlaylist(contextMenu.song.id, 'Favorites'); closeContextMenu(); }}>❤ Add to Favorites</div>
          <div onClick={() => { setRecentlyPlayed(prev => [contextMenu.song.id, ...prev]); closeContextMenu(); }}>▶ Play Next</div>
          <div className="divider"></div>
          {Object.keys(playlists).map(pl => pl !== 'Favorites' && (
            <div key={pl} onClick={() => { addToPlaylist(contextMenu.song.id, pl); closeContextMenu(); }}>+ Add to {pl}</div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {isDragActive && <div className="drag-overlay"><h1>📂 Drop Music Here</h1></div>}
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>New Playlist</h3>
            <input autoFocus type="text" placeholder="Name" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} />
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={createPlaylist}>Create</button>
            </div>
          </div>
        </div>
      )}

      {editModalData && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Song Details</h3>
            <input 
              type="text" 
              placeholder="Title" 
              value={editModalData.title || ''} 
              onChange={(e) => setEditModalData({ ...editModalData, title: e.target.value })} 
            />
            <input 
              type="text" 
              placeholder="Artist" 
              value={editModalData.artist || ''} 
              onChange={(e) => setEditModalData({ ...editModalData, artist: e.target.value })} 
            />
            <input 
              type="text" 
              placeholder="Album" 
              value={editModalData.album || ''} 
              onChange={(e) => setEditModalData({ ...editModalData, album: e.target.value })} 
            />
            <div className="modal-actions">
              <button onClick={() => setEditModalData(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
