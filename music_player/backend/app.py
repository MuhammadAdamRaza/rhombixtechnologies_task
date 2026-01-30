from flask import Flask, jsonify, send_from_directory, Response
from flask_cors import CORS
import os
import math
# mutagen is the library that reads audio metadata
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, APIC, TIT2, TPE1, TALB

# 1. Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MUSIC_DIR = os.path.join(BASE_DIR, 'music')

BUILD_DIR = os.path.join(BASE_DIR, 'build')

if not os.path.exists(MUSIC_DIR):
    os.makedirs(MUSIC_DIR)

# Initialize Flask with the correct static folder
app = Flask(__name__, static_folder=BUILD_DIR)
CORS(app)

# 2. Helper: Format seconds into M:SS
def format_duration(seconds):
    minutes = math.floor(seconds / 60)
    secs = math.floor(seconds % 60)
    return f"{minutes}:{secs:02d}"

# 3. Helper: Extract Metadata from a single file
def get_file_metadata(filename):
    filepath = os.path.join(MUSIC_DIR, filename)
    
    # Defaults
    title = os.path.splitext(filename)[0]
    artist = "Unknown Artist"
    album = "Unknown Album"
    duration_str = "--:--"
    has_cover = False

    try:
        audio = MP3(filepath, ID3=ID3)
        
        # Get Duration
        if audio.info:
            duration_str = format_duration(audio.info.length)

        # Get ID3 Tags (Title, Artist, Album)
        if audio.tags:
            if 'TIT2' in audio.tags: title = str(audio.tags['TIT2'])
            if 'TPE1' in audio.tags: artist = str(audio.tags['TPE1'])
            if 'TALB' in audio.tags: album = str(audio.tags['TALB'])
            
            # Check if embedded cover art exists (APIC frame)
            for key in audio.tags.keys():
                if key.startswith('APIC:'):
                    has_cover = True
                    break
                    
    except Exception as e:
        print(f"Error reading {filename}: {e}")

    # Determine Cover URL
    if has_cover:
        cover_url = f"/api/cover/{filename}"
    else:
        cover_url = None 

    return {
        "id": f"local_{filename}",
        "title": title,
        "artist": artist,
        "category": "My Library", 
        "album": album,
        "duration": duration_str,
        "url": f"/music/{filename}",
        "cover": cover_url
    }

# 4. API: Get All Music
@app.route('/api/music', methods=['GET'])
def get_music():
    playlist = []
    
    # Add Demos (Optional)
    playlist.extend([
        {
            "id": "demo1", "title": "Techno Dream", "artist": "SoundHelix", "category": "Electronic", "album": "Digital Horizons", "duration": "5:30",
            "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            "cover": None # Will show default art
        }
    ])

    # Scan Local Folder
    if os.path.exists(MUSIC_DIR):
        files = sorted(os.listdir(MUSIC_DIR))
        for filename in files:
            if filename.lower().endswith('.mp3'):
                metadata = get_file_metadata(filename)
                playlist.append(metadata)

    return jsonify(playlist)

# 5. API: Serve Embedded Album Art
@app.route('/api/cover/<path:filename>')
def get_cover(filename):
    filepath = os.path.join(MUSIC_DIR, filename)
    try:
        audio = MP3(filepath, ID3=ID3)
        if audio.tags:
            for key in audio.tags.keys():
                if key.startswith('APIC:'):
                    art = audio.tags[key]
                    return Response(art.data, mimetype=art.mime)
    except Exception as e:
        print(f"Error extracting cover: {e}")
    
    return "No Cover Found", 404

# 6. API: Categories
@app.route('/api/categories', methods=['GET'])
def get_categories():
    return jsonify(["My Library", "Electronic", "Classical", "Pop", "Rock"])

# 7. File Server: Stream Audio
@app.route('/music/<path:filename>')
def serve_music(filename):
    return send_from_directory(MUSIC_DIR, filename)

# ---------------------------------------------------------
# Serve React App 
# ---------------------------------------------------------
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """
    Serve static files from the React build folder.
    If the file doesn't exist (like a React route), return index.html.
    """
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    print(f"🚀 Music Server Running!")
    print(f"📂 Scanning: {MUSIC_DIR}")
    print(f"⚛️ Serving React from: {BUILD_DIR}")
    app.run(debug=True, port=5000)