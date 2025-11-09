import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { requestsAPI } from '../services/api'
import './HelpRequests.css'

function HelpRequests() {
  const { user } = useApp()
  const [viewMode, setViewMode] = useState('list')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    location: '',
    timeNeeded: '1 hour',
    image: null,
  })

  const categories = ['all', 'Accessibility', 'Medical', 'Community', 'Elderly Care', 'Language Support', 'Safety']
  const priorities = ['all', 'Urgent', 'High', 'Medium', 'Low']
  const statuses = ['all', 'Active', 'Assigned', 'Completed']

  // Load requests on component mount and when filters change
  useEffect(() => {
    loadRequests()
    
    // Real-time polling - update every 10 seconds
    const interval = setInterval(() => {
      loadRequests()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [selectedCategory, selectedPriority, selectedStatus, searchQuery, user?.id])

  const loadRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const filters = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        priority: selectedPriority !== 'all' ? selectedPriority : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchQuery || undefined,
      }
      // Remove undefined values
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key])
      
      const response = await requestsAPI.getAll(filters)
      let allRequests = response.requests || response || []
      
      // If user is not a guest, filter to show user-specific data when appropriate
      // (e.g., show user's own requests in a separate view if needed)
      // For now, show all requests but mark user's own requests
      if (user && !user.isGuest) {
        allRequests = allRequests.map(req => ({
          ...req,
          isMine: req.requesterId === user.id || req.requester === user.email,
          isAcceptedByMe: req.volunteerId === user.id || req.volunteer === user.email,
        }))
      }
      
      setRequests(allRequests)
    } catch (err) {
      setError(err.message || 'Failed to load requests')
      console.error('Error loading requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      setSubmitting(true)
      const updated = await requestsAPI.accept(requestId)
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r))
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(updated)
      }
      alert('Request accepted successfully!')
    } catch (err) {
      alert(err.message || 'Failed to accept request')
      console.error('Error accepting request:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetails = async (requestId) => {
    try {
      const request = await requestsAPI.getById(requestId)
      setSelectedRequest(request)
    } catch (err) {
      alert(err.message || 'Failed to load request details')
      console.error('Error loading request:', err)
    }
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    try {
      if (!user || user.isGuest) {
        alert('Please log in to create a request')
        return
      }
      
      setSubmitting(true)
      const requestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        location: formData.location,
        timeNeeded: formData.timeNeeded,
        requester: user?.name || user?.email || 'Current User',
        requesterId: user?.id || user?.sub || 'user_1',
        email: user?.email,
        distance: '0.5 mi', // Would be calculated from user location
        coordinates: user?.coordinates || { lat: 51.0447, lng: -114.0719 },
        skills: [],
      }
      
      const newRequest = await requestsAPI.create(requestData)
      setRequests(prev => [newRequest, ...prev])
      setShowRequestForm(false)
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'Medium',
        location: '',
        timeNeeded: '1 hour',
        image: null,
      })
      alert('Request created successfully!')
    } catch (err) {
      alert(err.message || 'Failed to create request')
      console.error('Error creating request:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return
    }
    try {
      setSubmitting(true)
      await requestsAPI.delete(requestId)
      setRequests(prev => prev.filter(r => r.id !== requestId))
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(null)
      }
      alert('Request deleted successfully')
    } catch (err) {
      alert(err.message || 'Failed to delete request')
      console.error('Error deleting request:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteRequest = async (requestId) => {
    try {
      setSubmitting(true)
      const completionData = {
        hoursSpent: 1,
        notes: 'Completed successfully',
      }
      const updated = await requestsAPI.complete(requestId, completionData)
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r))
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(updated)
      }
      alert('Request marked as completed!')
    } catch (err) {
      alert(err.message || 'Failed to complete request')
      console.error('Error completing request:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Filter requests client-side for additional filtering
  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchQuery === '' || 
      request.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.location?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  return (
    <div className="help-requests-container">
      <div className="help-requests-header">
        <div className="help-requests-header-content">
          <div className="help-requests-header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h1 className="help-requests-title">Help Requests</h1>
            <p className="help-requests-subtitle">Find and respond to community needs in your area</p>
          </div>
        </div>
        <div className="help-requests-header-actions">
          <div className="help-requests-view-toggle">
            <button
              className={`help-requests-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
            <button
              className={`help-requests-view-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
              aria-label="Map view"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </button>
          </div>
          <button 
            className="help-requests-create-btn"
            onClick={() => setShowRequestForm(true)}
            disabled={submitting}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Create Request</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="help-requests-filters-section">
        <div className="help-requests-search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="help-requests-search-input"
          />
        </div>
        <div className="help-requests-filters">
          <div className="help-requests-filter-group">
            <label>Category</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="help-requests-filter-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
          <div className="help-requests-filter-group">
            <label>Priority</label>
            <select 
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="help-requests-filter-select"
            >
              {priorities.map(pri => (
                <option key={pri} value={pri}>{pri === 'all' ? 'All Priorities' : pri}</option>
              ))}
            </select>
          </div>
          <div className="help-requests-filter-group">
            <label>Status</label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="help-requests-filter-select"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status === 'all' ? 'All Status' : status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="help-requests-results">
        <span className="help-requests-count">
          {loading ? 'Loading...' : `${filteredRequests.length} request${filteredRequests.length !== 1 ? 's' : ''} found`}
        </span>
        {error && (
          <div className="help-requests-error" style={{ color: '#ef4444', fontSize: '14px', fontWeight: 600 }}>
            {error}
          </div>
        )}
        <div className="help-requests-quick-filters">
          <button 
            className={`help-requests-quick-filter ${selectedPriority === 'Urgent' ? 'active' : ''}`}
            onClick={() => setSelectedPriority(selectedPriority === 'Urgent' ? 'all' : 'Urgent')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            </svg>
            Urgent
          </button>
          <button 
            className={`help-requests-quick-filter ${selectedStatus === 'Active' ? 'active' : ''}`}
            onClick={() => setSelectedStatus(selectedStatus === 'Active' ? 'all' : 'Active')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Active
          </button>
          <button 
            className={`help-requests-quick-filter ${selectedCategory === 'Accessibility' ? 'active' : ''}`}
            onClick={() => setSelectedCategory(selectedCategory === 'Accessibility' ? 'all' : 'Accessibility')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Accessibility
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(0,0,0,0.6)' }}>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading requests...</div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="help-requests-list-view">
          <div className="help-requests-grid">
            {filteredRequests.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No requests found</div>
                <div style={{ fontSize: '14px' }}>Try adjusting your filters or create a new request</div>
              </div>
            ) : (
              filteredRequests.map(request => (
                <div key={request.id} className="help-request-card">
                  <div className="help-request-card-header">
                    <div className="help-request-category-badge">{request.category || 'General'}</div>
                    <div className={`help-request-priority-badge ${(request.urgency || request.priority?.toLowerCase() || 'medium')}`}>
                      {request.priority || 'Medium'}
                    </div>
                  </div>
                  <h3 className="help-request-card-title">{request.title}</h3>
                  <p className="help-request-card-description">{request.description}</p>
                  <div className="help-request-card-meta">
                    <div className="help-request-meta-row">
                      <div className="help-request-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>{request.requester || 'Anonymous'}</span>
                      </div>
                      <div className="help-request-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>{request.distance || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="help-request-meta-row">
                      <div className="help-request-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>{request.time || 'Recently'}</span>
                      </div>
                      <div className="help-request-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                        </svg>
                        <span>{request.volunteerCount || 0} volunteer{(request.volunteerCount || 0) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  {request.skills && request.skills.length > 0 && (
                    <div className="help-request-skills">
                      {request.skills.map((skill, idx) => (
                        <span key={idx} className="help-request-skill-tag">{skill}</span>
                      ))}
                    </div>
                  )}
                  {request.translated && (
                    <div className="help-request-translation-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                      <span>Translated from {request.originalLanguage || 'another language'}</span>
                    </div>
                  )}
                  <div className="help-request-card-actions">
                    <button 
                      className="help-request-view-btn"
                      onClick={() => handleViewDetails(request.id)}
                      disabled={submitting}
                    >
                      View Details
                    </button>
                    {request.status === 'Active' && (
                      <button 
                        className="help-request-accept-btn"
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={submitting}
                      >
                        {submitting ? 'Processing...' : 'Accept Request'}
                      </button>
                    )}
                    {request.requesterId === user?.id && request.status !== 'Completed' && (
                      <button 
                        className="help-request-view-btn"
                        onClick={() => handleDeleteRequest(request.id)}
                        disabled={submitting}
                        style={{ marginTop: '8px', background: '#ef4444', color: '#fff' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="help-requests-map-view">
          <div className="help-requests-map-container">
            <div className="help-requests-map-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <h3>Interactive Map View</h3>
              <p>See all help requests plotted on a map with real-time updates</p>
              <div className="help-requests-map-legend">
                <div className="map-legend-item">
                  <div className="map-legend-dot urgent"></div>
                  <span>Urgent</span>
                </div>
                <div className="map-legend-item">
                  <div className="map-legend-dot high"></div>
                  <span>High Priority</span>
                </div>
                <div className="map-legend-item">
                  <div className="map-legend-dot medium"></div>
                  <span>Medium Priority</span>
                </div>
                <div className="map-legend-item">
                  <div className="map-legend-dot low"></div>
                  <span>Low Priority</span>
                </div>
              </div>
              <button className="help-requests-map-btn">Enable Map View</button>
            </div>
          </div>
          <div className="help-requests-map-sidebar">
            <h3 className="help-requests-map-sidebar-title">Nearby Requests</h3>
            <div className="help-requests-map-list">
              {filteredRequests.slice(0, 5).map(request => (
                <div 
                  key={request.id} 
                  className="help-request-map-item"
                  onClick={() => handleViewDetails(request.id)}
                >
                  <div className={`help-request-map-priority ${(request.urgency || request.priority?.toLowerCase() || 'medium')}`}></div>
                  <div className="help-request-map-content">
                    <h4>{request.title}</h4>
                    <p>{request.distance || 'N/A'} away</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="help-request-modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="help-request-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="help-request-modal-header">
              <div>
                <div className="help-request-modal-badges">
                  <span className="help-request-modal-category">{selectedRequest.category || 'General'}</span>
                  <span className={`help-request-modal-priority ${(selectedRequest.urgency || selectedRequest.priority?.toLowerCase() || 'medium')}`}>
                    {selectedRequest.priority || 'Medium'} Priority
                  </span>
                </div>
                <h2 className="help-request-modal-title">{selectedRequest.title}</h2>
                <p className="help-request-modal-requester">Requested by {selectedRequest.requester || 'Anonymous'}</p>
              </div>
              <button 
                className="help-request-modal-close"
                onClick={() => setSelectedRequest(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="help-request-modal-body">
              <div className="help-request-modal-section">
                <h3>Description</h3>
                <p>{selectedRequest.description}</p>
              </div>
              <div className="help-request-modal-details">
                <div className="help-request-modal-detail-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <div className="help-request-modal-detail-label">Location</div>
                    <div className="help-request-modal-detail-value">{selectedRequest.location || 'N/A'} • {selectedRequest.distance || 'N/A'} away</div>
                  </div>
                </div>
                <div className="help-request-modal-detail-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div>
                    <div className="help-request-modal-detail-label">Time Needed</div>
                    <div className="help-request-modal-detail-value">{selectedRequest.timeNeeded || 'N/A'}</div>
                  </div>
                </div>
                <div className="help-request-modal-detail-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div>
                    <div className="help-request-modal-detail-label">Posted</div>
                    <div className="help-request-modal-detail-value">{selectedRequest.time || 'Recently'}</div>
                  </div>
                </div>
                <div className="help-request-modal-detail-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                  </svg>
                  <div>
                    <div className="help-request-modal-detail-label">Volunteers</div>
                    <div className="help-request-modal-detail-value">{selectedRequest.volunteerCount || 0} volunteer{(selectedRequest.volunteerCount || 0) !== 1 ? 's' : ''} interested</div>
                  </div>
                </div>
              </div>
              {selectedRequest.skills && selectedRequest.skills.length > 0 && (
                <div className="help-request-modal-section">
                  <h3>Skills Needed</h3>
                  <div className="help-request-modal-skills">
                    {selectedRequest.skills.map((skill, idx) => (
                      <span key={idx} className="help-request-modal-skill">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedRequest.aiCategory && (
                <div className="help-request-modal-ai-info">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  <div>
                    <div className="help-request-modal-ai-label">AI Analysis</div>
                    <div className="help-request-modal-ai-value">Categorized as {selectedRequest.aiCategory} • {selectedRequest.aiPriority || selectedRequest.priority} Priority</div>
                  </div>
                </div>
              )}
            </div>
            <div className="help-request-modal-footer">
              {selectedRequest.status === 'Active' && (
                <button 
                  className="help-request-modal-accept-btn"
                  onClick={() => {
                    handleAcceptRequest(selectedRequest.id)
                    setSelectedRequest(null)
                  }}
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Accept This Request'}
                </button>
              )}
              {selectedRequest.requesterId === user?.id && selectedRequest.status === 'Assigned' && (
                <button 
                  className="help-request-modal-accept-btn"
                  onClick={() => {
                    handleCompleteRequest(selectedRequest.id)
                    setSelectedRequest(null)
                  }}
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Mark as Completed'}
                </button>
              )}
              <button 
                className="help-request-modal-close-btn"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Request Form Modal */}
      {showRequestForm && (
        <div className="help-request-modal-overlay" onClick={() => !submitting && setShowRequestForm(false)}>
          <div className="help-request-modal-content create-request-modal" onClick={(e) => e.stopPropagation()}>
            <div className="help-request-modal-header">
              <div>
                <h2 className="help-request-modal-title">Create Help Request</h2>
                <p className="help-request-modal-subtitle">Tell us what you need help with</p>
              </div>
              <button 
                className="help-request-modal-close"
                onClick={() => !submitting && setShowRequestForm(false)}
                disabled={submitting}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="help-request-modal-body">
              <form className="help-request-form" onSubmit={handleCreateRequest}>
                <div className="help-request-form-group">
                  <label>Title *</label>
                  <input 
                    type="text" 
                    placeholder="Brief description of what you need"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="help-request-form-group">
                  <label>Description *</label>
                  <textarea 
                    rows="4" 
                    placeholder="Tell us more about your request..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    disabled={submitting}
                  ></textarea>
                </div>
                <div className="help-request-form-row">
                  <div className="help-request-form-group">
                    <label>Category *</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      disabled={submitting}
                    >
                      <option value="">Select category</option>
                      <option>Accessibility</option>
                      <option>Medical</option>
                      <option>Elderly Care</option>
                      <option>Community</option>
                      <option>Language Support</option>
                      <option>Safety</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="help-request-form-group">
                    <label>Priority</label>
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      disabled={submitting}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="help-request-form-group">
                  <label>Location *</label>
                  <input 
                    type="text" 
                    placeholder="Your address or area"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="help-request-form-group">
                  <label>Estimated Time Needed</label>
                  <select 
                    value={formData.timeNeeded}
                    onChange={(e) => setFormData({ ...formData, timeNeeded: e.target.value })}
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
                <div className="help-request-form-group">
                  <label>Upload Photo (Optional)</label>
                  <div className="help-request-upload-area">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span>Click to upload or drag and drop</span>
                  </div>
                </div>
                <div className="help-request-form-actions">
                  <button 
                    type="button" 
                    className="help-request-form-cancel-btn"
                    onClick={() => setShowRequestForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="help-request-form-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Submit Request'}
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

export default HelpRequests
