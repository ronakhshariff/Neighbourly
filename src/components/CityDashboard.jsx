import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useError } from '../context/ErrorContext'
import { cityAPI } from '../services/api'
import CityAuthorityVerification from './CityAuthorityVerification'
import './CityDashboard.css'

function CityDashboard() {
  const { user } = useApp()
  const { showError, safeAsync } = useError()
  const navigate = useNavigate()
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')
  const [isVerified, setIsVerified] = useState(false)
  const [checkingVerification, setCheckingVerification] = useState(true)
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    completedToday: 0,
    avgResponseTime: '0 min',
    verifiedWorkers: 0,
    pendingVerifications: 0
  })
  const [recentRequests, setRecentRequests] = useState([])
  const [pendingVerifications, setPendingVerifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkVerificationStatus()
  }, [user])

  useEffect(() => {
    if (isVerified) {
      loadDashboardData()
      
      // Real-time polling - update every 10 seconds
      const interval = setInterval(() => {
        loadDashboardData()
      }, 10000)
      
      return () => clearInterval(interval)
    }
  }, [selectedTimeframe, isVerified])

  const checkVerificationStatus = async () => {
    try {
      setCheckingVerification(true)
      const status = await cityAPI.checkCityAuthorityStatus()
      setIsVerified(status.verified || status.status === 'approved')
    } catch (error) {
      console.error('Error checking verification status:', error)
      setIsVerified(false)
    } finally {
      setCheckingVerification(false)
    }
  }

  const handleVerified = () => {
    setIsVerified(true)
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, requestsData, verificationsData] = await Promise.all([
        cityAPI.getDashboardStats(selectedTimeframe),
        cityAPI.getRecentRequests(10),
        cityAPI.getPendingVerifications(),
      ])
      
      setStats(statsData)
      setRecentRequests(requestsData.requests || [])
      setPendingVerifications(verificationsData.verifications || [])
    } catch (error) {
      console.error('Error loading city dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyWorker = async (workerId, decision) => {
    if (!workerId || !decision) {
      showError('Invalid worker ID or decision')
      return
    }
    
    try {
      setSubmitting(true)
      const result = await safeAsync(
        () => cityAPI.verifyWorker(workerId, decision),
        'Failed to verify worker'
      )
      
      if (result) {
        await loadDashboardData()
      }
    } catch (error) {
      showError(error.message || 'Failed to verify worker. Please try again.')
      console.error('Error verifying worker:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewAllRequests = () => {
    navigate('/dashboard/city/requests')
  }

  const handleViewFullMap = () => {
    navigate('/dashboard/city/map')
  }

  // Show verification modal if not verified
  if (checkingVerification) {
    return (
      <div className="city-dashboard">
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', color: 'rgba(0,0,0,0.6)' }}>Checking verification status...</div>
        </div>
      </div>
    )
  }

  if (!isVerified) {
    return <CityAuthorityVerification onVerified={handleVerified} />
  }

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
            <div className="city-stat-value">{loading ? '...' : stats.totalRequests.toLocaleString()}</div>
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
            <div className="city-stat-value">{loading ? '...' : stats.pendingVerifications}</div>
            <div className="city-stat-change">Requires attention</div>
          </div>
        </div>
      </div>

      <div className="city-dashboard-grid">
        {/* Recent Requests */}
        <div className="city-dashboard-card">
          <div className="city-card-header">
            <h2 className="city-card-title">Recent Help Requests</h2>
            <button className="city-card-action" onClick={handleViewAllRequests}>View All</button>
          </div>
          <div className="city-requests-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Loading requests...</div>
              </div>
            ) : recentRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>No recent requests</div>
              </div>
            ) : (
              recentRequests.map(request => (
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
              ))
            )}
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="city-dashboard-card">
          <div className="city-card-header">
            <h2 className="city-card-title">Pending Verifications</h2>
            <span className="city-card-badge">{pendingVerifications.length}</span>
          </div>
          <div className="city-verifications-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Loading verifications...</div>
              </div>
            ) : pendingVerifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>No pending verifications</div>
              </div>
            ) : (
              pendingVerifications.map(verification => (
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
                  <button 
                    className="city-btn-approve"
                    onClick={() => handleVerifyWorker(verification.id, 'approved')}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : 'Approve'}
                  </button>
                  <button 
                    className="city-btn-review"
                    onClick={() => alert('Review feature - Worker ID: ' + verification.id)}
                    disabled={submitting}
                  >
                    Review
                  </button>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Heatmap Preview */}
      <div className="city-dashboard-card full-width">
        <div className="city-card-header">
          <h2 className="city-card-title">Request Heatmap</h2>
          <button className="city-card-action" onClick={handleViewFullMap}>View Full Map</button>
        </div>
        <div className="city-heatmap-preview">
          <div className="city-heatmap-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p>Interactive map showing request density and hotspots</p>
            <button className="city-btn-primary" onClick={handleViewFullMap}>Open Map View</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CityDashboard

