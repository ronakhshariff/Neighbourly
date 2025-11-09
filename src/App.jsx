// main app component - handles all the routing
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContextWrapper'
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
  const { isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* landing page */}
        <Route path="/" element={<HomePage />} />
        
        {/* login - if already logged in, go to dashboard */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        
        {/* dashboard routes - all protected */}
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
          {/* default to user dashboard */}
          <Route index element={<Navigate to="/dashboard/user" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
