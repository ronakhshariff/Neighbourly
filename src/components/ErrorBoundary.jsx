// catches react errors so the whole app doesn't crash
// shows error message instead of blank screen
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // log it so we can debug later
    console.error('react error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // something broke - show error instead of crashing
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#fff', minHeight: '100vh' }}>
          <h2 style={{ color: '#c33' }}>oops, something broke</h2>
          <p style={{ color: '#666', margin: '20px 0' }}>{this.state.error?.message || 'idk what happened'}</p>
          <pre style={{ background: '#f5f5f5', padding: '20px', textAlign: 'left', overflow: 'auto', fontSize: '12px' }}>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
          >
            reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

