import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#172b4d', background: '#f4f7fb', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#c2414e', marginBottom: '1rem' }}>Application Encountered an Error</h1>
          <pre style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e9f0', overflow: 'auto', marginTop: '1rem', color: '#52657d' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1.5rem', padding: '10px 22px', background: '#10b981', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
