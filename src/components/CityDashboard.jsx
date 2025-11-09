import React, { useState } from 'react'
import { helpRequests, cityRequests } from '../data/mockData'
import './CityDashboard.css'

function CityDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')

  // Mock data - using shared data
  const stats = {
    totalRequests: 1247,
    activeRequests: helpRequests.filter(r => r.status === 'Active').length,
    completedToday: 18,
    avgResponseTime: '4.2 min',
    verifiedWorkers: 156,
    pendingVerifications: 3
  }

  // Use shared data
  const recentRequests = cityRequests

  const pendingVerifications = [
    { id: 1, name: 'Sarah Johnson', role: 'City Worker', submitted: '2 hours ago', documents: 3 },
    { id: 2, name: 'Michael Chen', role: 'Emergency Responder', submitted: '5 hours ago', documents: 2 },
    { id: 3, name: 'Emily Rodriguez', role: 'City Planner', submitted: '1 day ago', documents: 4 }
  ]

  return (
    <div className="city-dashboard">
      <div className="city-dashboard-header">
        <div>
          <h1 className="city-dashboard-title">City Authorities Dashboard</h1>
          <p className="city-dashboard-subtitle">Monitor and manage community resilience in real-time for government officials and city planners</p>
        </div>
        <div className="city-dashboard-timeframe">
          <button 
            className={selectedTimeframe === '24h' ? 'active' : ''}
            onClick={() => setSelectedTimeframe('24h')}
          >
            24h
          </button>
          <button 
            className={selectedTimeframe === '7d' ? 'active' : ''}
            onClick={() => setSelectedTimeframe('7d')}
          >
            7d
          </button>
          <button 
            className={selectedTimeframe === '30d' ? 'active' : ''}
            onClick={() => setSelectedTimeframe('30d')}
          >
            30d
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="city-stats-grid">
        <div className="city-stat-card primary">
          <div className="city-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className="city-stat-content">
            <div className="city-stat-label">Total Requests</div>
            <div className="city-stat-value">{stats.totalRequests.toLocaleString()}</div>
            <div className="city-stat-change positive">+12% from last week</div>
          </div>
        </div>

        <div className="city-stat-card">
          <div className="city-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="city-stat-content">
            <div className="city-stat-label">Avg Response Time</div>
            <div className="city-stat-value">{stats.avgResponseTime}</div>
            <div className="city-stat-change positive">-15% faster</div>
          </div>
        </div>

        <div className="city-stat-card">
          <div className="city-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="city-stat-content">
            <div className="city-stat-label">Verified Workers</div>
            <div className="city-stat-value">{stats.verifiedWorkers}</div>
            <div className="city-stat-change positive">+8 this week</div>
          </div>
        </div>

        <div className="city-stat-card warning">
          <div className="city-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="city-stat-content">
            <div className="city-stat-label">Pending Verifications</div>
            <div className="city-stat-value">{stats.pendingVerifications}</div>
            <div className="city-stat-change">Requires attention</div>
          </div>
        </div>
      </div>

      <div className="city-dashboard-grid">
        {/* Recent Requests */}
        <div className="city-dashboard-card">
          <div className="city-card-header">
            <h2 className="city-card-title">Recent Help Requests</h2>
            <button className="city-card-action">View All</button>
          </div>
          <div className="city-requests-list">
            {recentRequests.map(request => (
              <div key={request.id} className="city-request-item">
                <div className="city-request-type">
                  <div className={`city-request-priority ${request.priority.toLowerCase()}`}>
                    {request.type}
                  </div>
                  <span className="city-request-location">{request.location}</span>
                </div>
                <div className="city-request-meta">
                  <span className={`city-request-status ${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                  <span className="city-request-time">{request.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="city-dashboard-card">
          <div className="city-card-header">
            <h2 className="city-card-title">Pending Verifications</h2>
            <span className="city-card-badge">{pendingVerifications.length}</span>
          </div>
          <div className="city-verifications-list">
            {pendingVerifications.map(verification => (
              <div key={verification.id} className="city-verification-item">
                <div className="city-verification-avatar">
                  <span>{verification.name.charAt(0)}</span>
                </div>
                <div className="city-verification-info">
                  <div className="city-verification-name">{verification.name}</div>
                  <div className="city-verification-role">{verification.role}</div>
                  <div className="city-verification-meta">
                    <span>{verification.documents} documents</span>
                    <span>•</span>
                    <span>{verification.submitted}</span>
                  </div>
                </div>
                <div className="city-verification-actions">
                  <button className="city-btn-approve">Approve</button>
                  <button className="city-btn-review">Review</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Preview */}
      <div className="city-dashboard-card full-width">
        <div className="city-card-header">
          <h2 className="city-card-title">Request Heatmap</h2>
          <button className="city-card-action">View Full Map</button>
        </div>
        <div className="city-heatmap-preview">
          <div className="city-heatmap-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p>Interactive map showing request density and hotspots</p>
            <button className="city-btn-primary">Open Map View</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CityDashboard

