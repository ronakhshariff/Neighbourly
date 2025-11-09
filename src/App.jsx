import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useFirebaseAuth } from './contexts/FirebaseAuthContext'
import { AppProvider } from './context/AppContext'
import { ErrorProvider } from './context/ErrorContext'
import DashboardLayout from './components/DashboardLayout'
import CityDashboard from './components/CityDashboard'
import UserDashboard from './components/UserDashboard'
import Roadmap from './components/Roadmap'
import Volunteer from './components/Volunteer'
import HelpRequests from './components/HelpRequests'
import HomePage from './components/HomePage'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  const { isAuthenticated, loading } = useFirebaseAuth()

  // Show loading state while checking initial auth
  if (loading) {
    return (
      <div style={{ 
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

  return (
    <ErrorProvider>
      <AppProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* login - if already logged in, redirect to dashboard */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard/user" replace /> : <Login />} 
          />
          
          {/* dashboard routes - all protected - require authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="city" element={<CityDashboard />} />
            <Route path="user" element={<UserDashboard />} />
            <Route path="city/roadmap" element={<Roadmap />} />
            <Route path="user/roadmap" element={<Roadmap />} />
            <Route path="user/volunteer" element={<Volunteer />} />
            <Route path="city/requests" element={<HelpRequests />} />
            <Route path="user/requests" element={<HelpRequests />} />
            <Route path="user/map" element={<HelpRequests />} />
            <Route path="city/map" element={<HelpRequests />} />
            {/* default to user dashboard */}
            <Route index element={<Navigate to="/dashboard/user" replace />} />
          </Route>
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </AppProvider>
    </ErrorProvider>
  )
}

export default App
