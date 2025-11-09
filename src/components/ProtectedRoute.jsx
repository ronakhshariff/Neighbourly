// wrapper for routes that need auth - allows guest access for now
import React from 'react'
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext'

function ProtectedRoute({ children }) {
  const { loading } = useFirebaseAuth()

  // wait for auth check to finish
  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>loading...</div>
  }

  // allow guest access - show content regardless of auth status
  // components will handle showing appropriate data based on auth state
  return children
}

export default ProtectedRoute

