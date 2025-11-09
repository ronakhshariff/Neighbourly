import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout'
import CityDashboard from './components/CityDashboard'
import UserDashboard from './components/UserDashboard'
import Roadmap from './components/Roadmap'
import Volunteer from './components/Volunteer'
import HelpRequests from './components/HelpRequests'
import HomePage from './components/HomePage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="city" element={<CityDashboard />} />
          <Route path="user" element={<UserDashboard />} />
          <Route path="city/roadmap" element={<Roadmap />} />
          <Route path="user/roadmap" element={<Roadmap />} />
          <Route path="user/volunteer" element={<Volunteer />} />
          <Route path="city/requests" element={<HelpRequests />} />
          <Route path="user/requests" element={<HelpRequests />} />
          <Route index element={<Navigate to="/dashboard/user" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
