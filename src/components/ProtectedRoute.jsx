// wrapper for routes that need auth - redirects to login if not logged in
import React from 'react'
import { useAuth } from '../contexts/AuthContextWrapper'
import Login from './Login'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  // wait for auth check to finish
  if (loading) {
    return <div>loading...</div>
  }

  // not logged in? show login page
  if (!isAuthenticated) {
    return <Login />
  }

  // all good, show the protected content
  return children
}

export default ProtectedRoute

