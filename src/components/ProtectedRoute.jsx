// Protected route - requires authentication
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useFirebaseAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px', fontWeight: 600 }}>
          Loading...
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // User is authenticated, show protected content
  return children
}

export default ProtectedRoute

