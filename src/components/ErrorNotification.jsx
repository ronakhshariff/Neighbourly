import React, { useEffect } from 'react'
import './ErrorNotification.css'

function ErrorNotification({ error, onClose, autoClose = true, duration = 5000 }) {
  useEffect(() => {
    if (autoClose && error) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [error, autoClose, duration, onClose])

  if (!error) return null

  return (
    <div className="error-notification-overlay" onClick={onClose}>
      <div className="error-notification" onClick={(e) => e.stopPropagation()}>
        <div className="error-notification-bg-orb error-orb-1"></div>
        <div className="error-notification-bg-orb error-orb-2"></div>
        <div className="error-notification-bg-orb error-orb-3"></div>
        
        <button 
          className="error-notification-close" 
          onClick={onClose}
          aria-label="Close error"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="error-notification-header">
          <div className="error-notification-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3 className="error-notification-title">Oops! Something went wrong</h3>
        </div>

        <div className="error-notification-body">
          <p className="error-notification-message">
            {typeof error === 'string' ? error : error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          {error.details && (
            <details className="error-notification-details">
              <summary>Technical Details</summary>
              <pre>{JSON.stringify(error.details, null, 2)}</pre>
            </details>
          )}
        </div>

        <div className="error-notification-footer">
          <button 
            className="error-notification-btn"
            onClick={onClose}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorNotification

