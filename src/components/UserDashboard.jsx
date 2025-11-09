import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { requestsAPI, volunteerAPI } from '../services/api'
import './UserDashboard.css'

function UserDashboard() {
  const { user } = useApp()
  const navigate = useNavigate()
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [nearbyRequests, setNearbyRequests] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [stats, setStats] = useState({
    nearbyCount: 0,
    activeHelps: 0,
    completedHelps: 0,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [requestFormData, setRequestFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    priority: 'Medium',
    timeNeeded: '1 hour',
  })

  useEffect(() => {
    loadDashboardData()
    
    // Real-time polling - update every 10 seconds
    const interval = setInterval(() => {
      loadDashboardData()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [user?.id]) // Reload when user changes

  const loadDashboardData = async () => {
    try {
      if (!user || user.isGuest) {
        // For guest users, show limited data
        setLoading(false)
        return
      }
      
      setLoading(true)
      
      // Load nearby requests - user-specific based on location
      const requestsResponse = await requestsAPI.getAll({ 
        status: 'Active',
        limit: 10
      })
      const allRequests = requestsResponse.requests || requestsResponse || []
      setNearbyRequests(allRequests.slice(0, 3))
      setStats(prev => ({ ...prev, nearbyCount: allRequests.length }))

      // Load my requests - user-specific
      try {
        const myRequestsResponse = await requestsAPI.getMyRequests()
        const myReqs = myRequestsResponse.requests || myRequestsResponse || []
        setMyRequests(myReqs.slice(0, 5))
      } catch (err) {
        // Filter by user ID if getMyRequests not available
        const myReqs = allRequests.filter(req => 
          req.requesterId === user.id || req.requester === user.email
        )
        setMyRequests(myReqs.slice(0, 5))
      }

      // Load volunteer stats - user-specific
      try {
        const volunteerStats = await volunteerAPI.getStats()
        setStats(prev => ({
          ...prev,
          activeHelps: volunteerStats.currentActive || volunteerStats.active || 0,
          completedHelps: volunteerStats.totalHelps || volunteerStats.completed || 0,
        }))
      } catch (err) {
        // Calculate from accepted requests
        const acceptedReqs = allRequests.filter(req => 
          req.volunteerId === user.id || req.volunteer === user.email
        )
        const active = acceptedReqs.filter(r => r.status === 'In Progress' || r.status === 'Active').length
        const completed = acceptedReqs.filter(r => r.status === 'Completed').length
        setStats(prev => ({
          ...prev,
          activeHelps: active,
          completedHelps: completed,
        }))
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      setSubmitting(true)
      await requestsAPI.accept(requestId)
      alert('Request accepted! Check the Volunteer tab for details.')
      await loadDashboardData()
    } catch (error) {
      alert(error.message || 'Failed to accept request')
      console.error('Error accepting request:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewAllRequests = () => {
    navigate('/dashboard/user/requests')
  }

  const handleViewMap = () => {
    navigate('/dashboard/user/map')
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      if (!user || user.isGuest) {
        alert('Please log in to create a request')
        return
      }
      
      const requestData = {
        title: requestFormData.title,
        description: requestFormData.description,
        category: requestFormData.category,
        priority: requestFormData.priority,
        location: requestFormData.location,
        timeNeeded: requestFormData.timeNeeded,
        requester: user?.name || user?.email || 'Current User',
        requesterId: user?.id || user?.sub || 'user_1',
        email: user?.email,
        distance: '0.5 mi',
        coordinates: user?.coordinates || { lat: 51.0447, lng: -114.0719 },
        skills: [],
      }
      
      await requestsAPI.create(requestData)
      alert('Request created successfully!')
      setShowRequestForm(false)
      setRequestFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        priority: 'Medium',
        timeNeeded: '1 hour',
      })
      await loadDashboardData()
    } catch (error) {
      alert(error.message || 'Failed to create request')
      console.error('Error creating request:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="user-dashboard">
      <div className="user-dashboard-header">
        <div>
          <h1 className="user-dashboard-title">Welcome back!</h1>
          <p className="user-dashboard-subtitle">See how you can help your community today</p>
        </div>
        <button 
          className="user-btn-create-request"
          onClick={() => setShowRequestForm(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Request Help</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="user-stats-row">
        <div className="user-stat-mini">
          <div className="user-stat-mini-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <div className="user-stat-mini-value">{loading ? '...' : stats.nearbyCount}</div>
            <div className="user-stat-mini-label">Nearby Requests</div>
          </div>
        </div>
        <div className="user-stat-mini">
          <div className="user-stat-mini-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <div className="user-stat-mini-value">{loading ? '...' : stats.activeHelps}</div>
            <div className="user-stat-mini-label">Active Helps</div>
          </div>
        </div>
        <div className="user-stat-mini">
          <div className="user-stat-mini-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div>
            <div className="user-stat-mini-value">{loading ? '...' : stats.completedHelps}</div>
            <div className="user-stat-mini-label">Helps Completed</div>
          </div>
        </div>
      </div>

      <div className="user-dashboard-grid">
        {/* Nearby Requests */}
        <div className="user-dashboard-card">
          <div className="user-card-header">
            <h2 className="user-card-title">Nearby Help Requests</h2>
            <button className="user-card-action" onClick={handleViewMap}>View Map</button>
          </div>
          <div className="user-requests-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Loading requests...</div>
              </div>
            ) : nearbyRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>No nearby requests</div>
                <div style={{ fontSize: '12px' }}>Check back later or create a request</div>
              </div>
            ) : (
              nearbyRequests.map(request => (
              <div key={request.id} className="user-request-card">
                <div className="user-request-header">
                  <div className="user-request-category">{request.category}</div>
                  <div className={`user-request-priority ${request.priority.toLowerCase()}`}>
                    {request.priority}
                  </div>
                </div>
                <h3 className="user-request-title">{request.title}</h3>
                <p className="user-request-description">{request.description}</p>
                <div className="user-request-footer">
                  <div className="user-request-meta">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{request.distance}</span>
                    <span>•</span>
                    <span>{request.time}</span>
                  </div>
                  <div className="user-request-volunteers">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                    </svg>
                    <span>{request.volunteerCount} volunteers</span>
                  </div>
                </div>
                <button 
                  className="user-btn-accept"
                  onClick={() => handleAcceptRequest(request.id)}
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Accept Request'}
                </button>
              </div>
              ))
            )}
          </div>
        </div>

        {/* My Requests */}
        <div className="user-dashboard-card">
          <div className="user-card-header">
            <h2 className="user-card-title">My Requests</h2>
            <button className="user-card-action" onClick={handleViewAllRequests}>View All</button>
          </div>
          <div className="user-my-requests-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Loading your requests...</div>
              </div>
            ) : myRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>No requests yet</div>
                <div style={{ fontSize: '12px' }}>Create a request to get help from neighbors</div>
              </div>
            ) : (
              myRequests.map(request => (
              <div key={request.id} className="user-my-request-item">
                <div className="user-my-request-content">
                  <h3 className="user-my-request-title">{request.title}</h3>
                  {request.volunteer && (
                    <div className="user-my-request-volunteer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span>{request.volunteer}</span>
                    </div>
                  )}
                  <div className="user-my-request-time">{request.time}</div>
                </div>
                <div className={`user-my-request-status ${request.status.toLowerCase()}`}>
                  {request.status}
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="user-dashboard-card full-width">
        <div className="user-card-header">
          <h2 className="user-card-title">Quick Actions</h2>
        </div>
        <div className="user-quick-actions">
          <button 
            className="user-quick-action-btn"
            onClick={handleViewMap}
          >
            <div className="user-quick-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="user-quick-action-content">
              <div className="user-quick-action-title">View Map</div>
              <div className="user-quick-action-desc">See all requests on map</div>
            </div>
          </button>
          <button 
            className="user-quick-action-btn"
            onClick={() => navigate('/dashboard/user/roadmap')}
          >
            <div className="user-quick-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3zM7 7h10M7 12h10M7 17h6"/>
              </svg>
            </div>
            <div className="user-quick-action-content">
              <div className="user-quick-action-title">Roadmap</div>
              <div className="user-quick-action-desc">Accessibility guide</div>
            </div>
          </button>
          <button 
            className="user-quick-action-btn"
            onClick={() => navigate('/dashboard/user/volunteer')}
          >
            <div className="user-quick-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="user-quick-action-content">
              <div className="user-quick-action-title">Volunteer</div>
              <div className="user-quick-action-desc">Become a volunteer</div>
            </div>
          </button>
          <button 
            className="user-quick-action-btn"
            onClick={() => navigate('/dashboard/user/requests')}
          >
            <div className="user-quick-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="user-quick-action-content">
              <div className="user-quick-action-title">Help Requests</div>
              <div className="user-quick-action-desc">View all requests</div>
            </div>
          </button>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="user-modal-overlay" onClick={() => setShowRequestForm(false)}>
          <div className="user-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="user-modal-header">
              <h2 className="user-modal-title">Request Help</h2>
              <button 
                className="user-modal-close"
                onClick={() => setShowRequestForm(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="user-modal-body">
              <form className="user-request-form" onSubmit={handleSubmitRequest}>
                <div className="user-form-group">
                  <label>Title *</label>
                  <input 
                    type="text" 
                    placeholder="Brief description of what you need"
                    value={requestFormData.title}
                    onChange={(e) => setRequestFormData({ ...requestFormData, title: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="user-form-group">
                  <label>Description *</label>
                  <textarea 
                    rows="4" 
                    placeholder="Tell us more about your request..."
                    value={requestFormData.description}
                    onChange={(e) => setRequestFormData({ ...requestFormData, description: e.target.value })}
                    required
                    disabled={submitting}
                  ></textarea>
                </div>
                <div className="user-form-group">
                  <label>Category *</label>
                  <select
                    value={requestFormData.category}
                    onChange={(e) => setRequestFormData({ ...requestFormData, category: e.target.value })}
                    required
                    disabled={submitting}
                  >
                    <option value="">Select category</option>
                    <option>Accessibility</option>
                    <option>Medical</option>
                    <option>Safety</option>
                    <option>Community</option>
                    <option>Elderly Care</option>
                    <option>Language Support</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="user-form-group">
                  <label>Priority</label>
                  <select
                    value={requestFormData.priority}
                    onChange={(e) => setRequestFormData({ ...requestFormData, priority: e.target.value })}
                    disabled={submitting}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div className="user-form-group">
                  <label>Location *</label>
                  <input 
                    type="text" 
                    placeholder="Your address or area"
                    value={requestFormData.location}
                    onChange={(e) => setRequestFormData({ ...requestFormData, location: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="user-form-group">
                  <label>Estimated Time Needed</label>
                  <select
                    value={requestFormData.timeNeeded}
                    onChange={(e) => setRequestFormData({ ...requestFormData, timeNeeded: e.target.value })}
                    disabled={submitting}
                  >
                    <option>15-30 min</option>
                    <option>30-45 min</option>
                    <option>1 hour</option>
                    <option>1-2 hours</option>
                    <option>2-3 hours</option>
                    <option>3+ hours</option>
                  </select>
                </div>
                <div className="user-form-actions">
                  <button 
                    type="button" 
                    className="user-btn-cancel" 
                    onClick={() => !submitting && setShowRequestForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="user-btn-submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDashboard

