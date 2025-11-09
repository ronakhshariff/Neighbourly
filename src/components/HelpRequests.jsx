import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useError } from '../context/ErrorContext'
import { requestsAPI, roadmapAPI } from '../services/api'
import InteractiveMap from './InteractiveMap'
import './HelpRequests.css'

function HelpRequests() {
  const { user } = useApp()
  const { showError, safeAsync } = useError()
  const location = useLocation()
  
  // Determine initial view mode based on route
  const getInitialViewMode = () => {
    const path = location.pathname
    if (path.includes('/map')) return 'map'
    if (path.includes('/requests')) return 'list'
    return 'list' // default
  }
  
  const [viewMode, setViewMode] = useState(getInitialViewMode())

  // Update viewMode when route changes
  useEffect(() => {
    const path = location.pathname
    if (path.includes('/map')) {
      setViewMode('map')
    } else if (path.includes('/requests')) {
      setViewMode('list')
    }
  }, [location.pathname])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedLayer, setSelectedLayer] = useState('all') // For map legend
  const [showAccessibleRoads, setShowAccessibleRoads] = useState(true) // For map legend
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [requests, setRequests] = useState([])
  const [accessibleBusinesses, setAccessibleBusinesses] = useState([])
  const [specialNeedsLocations, setSpecialNeedsLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
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

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
          // Use default location (Calgary)
          setUserLocation({ lat: 51.0447, lng: -114.0719 })
        }
      )
    } else {
      setUserLocation({ lat: 51.0447, lng: -114.0719 })
    }
  }, [])

  // Load requests on component mount and when filters change
  useEffect(() => {
    loadRequests()
    loadAccessibleData()
    
    // Real-time polling - update every 10 seconds
    const interval = setInterval(() => {
      loadRequests()
      loadAccessibleData()
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
      
      const response = await safeAsync(
        () => requestsAPI.getAll(filters),
        'Failed to load requests'
      )
      
      if (response) {
        let allRequests = response.requests || response || []
        
        // Ensure it's an array
        if (!Array.isArray(allRequests)) {
          allRequests = []
        }
        
        // If user is not a guest, filter to show user-specific data when appropriate
        if (user && !user.isGuest) {
          allRequests = allRequests.map(req => ({
            ...req,
            isMine: req.requesterId === user.id || req.requester === user.email,
            isAcceptedByMe: req.volunteerId === user.id || req.volunteer === user.email,
          }))
        }
        
        setRequests(allRequests)
        setError(null)
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to load requests'
      setError(errorMsg)
      showError(errorMsg)
      console.error('Error loading requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadAccessibleData = async () => {
    try {
      // Load accessible businesses
      const businessesResponse = await safeAsync(
        () => roadmapAPI.getBusinesses({ 
          accessible: true,
          specialNeeds: true 
        }),
        'Failed to load businesses'
      )
      
      if (businessesResponse) {
        const businesses = Array.isArray(businessesResponse) 
          ? businessesResponse 
          : (businessesResponse.businesses || [])
        
        // Ensure all businesses have proper coordinate structure
        const businessesWithCoords = businesses.map(biz => ({
          ...biz,
          coordinates: biz.coordinates || { lat: biz.latitude, lng: biz.longitude },
          latitude: biz.latitude || biz.coordinates?.lat,
          longitude: biz.longitude || biz.coordinates?.lng,
        })).filter(biz => biz.latitude && biz.longitude) // Only include businesses with valid coordinates
        
        setAccessibleBusinesses(businessesWithCoords)
      }

      // Load special needs support locations
      const supportResponse = await safeAsync(
        () => roadmapAPI.getSupportServices(),
        'Failed to load support services'
      )
      
      if (supportResponse) {
        const services = Array.isArray(supportResponse)
          ? supportResponse
          : (supportResponse.services || [])
        
        // Ensure all locations have proper coordinate structure
        const locationsWithCoords = services.map(loc => ({
          ...loc,
          coordinates: loc.coordinates || { lat: loc.latitude, lng: loc.longitude },
          latitude: loc.latitude || loc.coordinates?.lat,
          longitude: loc.longitude || loc.coordinates?.lng,
        })).filter(loc => loc.latitude && loc.longitude) // Only include locations with valid coordinates
        
        setSpecialNeedsLocations(locationsWithCoords)
      }
    } catch (err) {
      console.error('Error loading accessible data:', err)
      // Data will remain empty, map will just show requests
    }
  }

  const handleAcceptRequest = async (requestId) => {
    if (!requestId) {
      showError('Invalid request ID')
      return
    }
    
    try {
      setSubmitting(true)
      const updated = await safeAsync(
        () => requestsAPI.accept(requestId),
        'Failed to accept request'
      )
      
      if (updated) {
        setRequests(prev => prev.map(r => 
          (r.id === updated.id || r.requestId === updated.id || r.requestId === updated.requestId) ? updated : r
        ))
        if (selectedRequest && (selectedRequest.id === requestId || selectedRequest.requestId === requestId)) {
          setSelectedRequest(updated)
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to accept request. Please try again.')
      console.error('Error accepting request:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetails = async (requestId) => {
    if (!requestId) {
      showError('Invalid request ID')
      return
    }
    
    try {
      const request = await safeAsync(
        () => requestsAPI.getById(requestId),
        'Failed to load request details'
      )
      
      if (request) {
        setSelectedRequest(request)
      }
    } catch (err) {
      showError(err.message || 'Failed to load request details. Please try again.')
      console.error('Error loading request:', err)
    }
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    try {
      if (!user || user.isGuest) {
        showError('Please log in to create a request')
        return
      }
      
      // Validation
      if (!formData.title || formData.title.trim().length < 3) {
        showError('Title must be at least 3 characters')
        return
      }
      
      if (!formData.description || formData.description.trim().length < 10) {
        showError('Description must be at least 10 characters')
        return
      }
      
      if (!formData.category) {
        showError('Please select a category')
        return
      }
      
      setSubmitting(true)
      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        location: formData.location || user?.location || 'Calgary',
        timeNeeded: formData.timeNeeded,
        requester: user?.name || user?.email || 'Current User',
        requesterId: user?.id || user?.sub,
        email: user?.email,
        distance: '0.5 mi',
        coordinates: user?.coordinates || { lat: 51.0447, lng: -114.0719 },
        skills: [],
      }
      
      const newRequest = await safeAsync(
        () => requestsAPI.create(requestData),
        'Failed to create request'
      )
      
      if (newRequest) {
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
      }
    } catch (err) {
      showError(err.message || 'Failed to create request. Please try again.')
      console.error('Error creating request:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRequest = async (requestId) => {
    if (!requestId) {
      showError('Invalid request ID')
      return
    }
    
    // Use a simple confirmation - could be replaced with a beautiful modal later
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return
    }
    
    try {
      setSubmitting(true)
      const result = await safeAsync(
        () => requestsAPI.delete(requestId),
        'Failed to delete request'
      )
      
      if (result) {
        setRequests(prev => prev.filter(r => r.id !== requestId && r.requestId !== requestId))
        if (selectedRequest && (selectedRequest.id === requestId || selectedRequest.requestId === requestId)) {
          setSelectedRequest(null)
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to delete request. Please try again.')
      console.error('Error deleting request:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteRequest = async (requestId) => {
    if (!requestId) {
      showError('Invalid request ID')
      return
    }
    
    try {
      setSubmitting(true)
      const completionData = {
        hoursSpent: 1,
        notes: 'Completed successfully',
      }
      const updated = await safeAsync(
        () => requestsAPI.complete(requestId, completionData),
        'Failed to complete request'
      )
      
      if (updated) {
        setRequests(prev => prev.map(r => 
          (r.id === updated.id || r.requestId === updated.id || r.requestId === updated.requestId) ? updated : r
        ))
        if (selectedRequest && (selectedRequest.id === requestId || selectedRequest.requestId === requestId)) {
          setSelectedRequest(updated)
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to complete request. Please try again.')
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
            {viewMode === 'map' ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            )}
          </div>
          <div>
            <h1 className="help-requests-title">
              {viewMode === 'map' ? 'Community Map' : 'Help Requests'}
            </h1>
            <p className="help-requests-subtitle">
              {viewMode === 'map' 
                ? 'Explore accessible locations, businesses, and nearby help requests on the map' 
                : 'Find and respond to community needs in your area'}
            </p>
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
          {/* Map Legend Sidebar - Left */}
          <div className="help-requests-map-legend-sidebar">
            <div className="map-legend">
              <div className="map-legend-title">Map Legend</div>
              {selectedLayer === 'all' || selectedLayer === 'requests' ? (
                <div className="map-legend-section">
                  <div className="map-legend-subtitle">Help Requests</div>
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
              ) : null}
              {selectedLayer === 'all' || selectedLayer === 'businesses' ? (
                <div className="map-legend-section">
                  <div className="map-legend-subtitle">Businesses</div>
                  <div className="map-legend-item">
                    <div className="map-legend-dot business"></div>
                    <span>Accessible Business</span>
                  </div>
                </div>
              ) : null}
              {selectedLayer === 'all' || selectedLayer === 'accessibility' ? (
                <div className="map-legend-section">
                  <div className="map-legend-subtitle">Services</div>
                  <div className="map-legend-item">
                    <div className="map-legend-dot accessibility"></div>
                    <span>Accessibility Service</span>
                  </div>
                </div>
              ) : null}
              {showAccessibleRoads && (
                <div className="map-legend-section">
                  <div className="map-legend-subtitle">Accessibility</div>
                  <div className="map-legend-item">
                    <div className="map-legend-line accessible"></div>
                    <span>Accessible Route</span>
                  </div>
                  <div className="map-legend-item">
                    <div className="map-legend-area accessible"></div>
                    <span>Accessible Zone</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Container - Center */}
          <div className="help-requests-map-container">
            <InteractiveMap
              requests={filteredRequests}
              accessibleBusinesses={accessibleBusinesses}
              specialNeedsLocations={specialNeedsLocations}
              onRequestClick={handleViewDetails}
              userLocation={userLocation}
              center={userLocation ? [userLocation.lng, userLocation.lat] : [-114.0719, 51.0447]}
              zoom={userLocation ? 13 : 12}
              selectedLayer={selectedLayer}
              onLayerChange={setSelectedLayer}
              showAccessibleRoads={showAccessibleRoads}
              onAccessibleRoadsToggle={setShowAccessibleRoads}
            />
          </div>

          {/* Nearby Requests Sidebar - Right */}
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
