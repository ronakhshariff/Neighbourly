import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useError } from '../context/ErrorContext'
import { volunteerAPI } from '../services/api'
import './Volunteer.css'

function Volunteer() {
  const { user } = useApp()
  const { showError, safeAsync } = useError()
  const [activeTab, setActiveTab] = useState('active')
  const [volunteerStats, setVolunteerStats] = useState({
    totalHelps: 0,
    hoursVolunteered: 0,
    currentActive: 0,
    rating: 0,
    streak: 0
  })
  const [myActiveHelps, setMyActiveHelps] = useState([])
  const [achievements, setAchievements] = useState([])
  const [volunteerHistory, setVolunteerHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Load data based on active tab
  useEffect(() => {
    if (!user || user.isGuest) {
      setLoading(false)
      return
    }
    
    loadData()
    
    // Real-time polling - update every 10 seconds
    const interval = setInterval(() => {
      loadData()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [activeTab, user?.id])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Always load stats
      const stats = await volunteerAPI.getStats()
      setVolunteerStats(stats)

      if (activeTab === 'active') {
        const response = await volunteerAPI.getMyHelps()
        setMyActiveHelps(response.helps || response || [])
      } else if (activeTab === 'achievements') {
        const response = await volunteerAPI.getAchievements()
        setAchievements(response.achievements || response || [])
      } else if (activeTab === 'history') {
        const response = await volunteerAPI.getHistory()
        setVolunteerHistory(response.history || response || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to load data')
      console.error('Error loading volunteer data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkComplete = async (helpId, hoursSpent = 1) => {
    if (!helpId) {
      showError('Invalid help ID')
      return
    }
    
    try {
      setSubmitting(true)
      const result = await safeAsync(
        () => volunteerAPI.markComplete(helpId, { hoursSpent, notes: 'Completed successfully' }),
        'Failed to mark as complete'
      )
      
      if (result) {
        // Reload data
        await loadData()
      }
    } catch (err) {
      showError(err.message || 'Failed to mark as complete. Please try again.')
      console.error('Error marking complete:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="volunteer-container">
      <div className="volunteer-header">
        <div className="volunteer-header-content">
          <div className="volunteer-header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <h1 className="volunteer-title">Volunteer Hub</h1>
            <p className="volunteer-subtitle">Make a difference in your community, one help at a time</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="volunteer-stats-grid">
        <div className="volunteer-stat-card primary">
          <div className="volunteer-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="volunteer-stat-content">
            <div className="volunteer-stat-label">Total Helps</div>
            <div className="volunteer-stat-value">{volunteerStats.totalHelps}</div>
            <div className="volunteer-stat-change positive">+3 this week</div>
          </div>
        </div>

        <div className="volunteer-stat-card">
          <div className="volunteer-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="volunteer-stat-content">
            <div className="volunteer-stat-label">Hours Volunteered</div>
            <div className="volunteer-stat-value">{volunteerStats.hoursVolunteered}</div>
            <div className="volunteer-stat-change positive">+8 this month</div>
          </div>
        </div>

        <div className="volunteer-stat-card">
          <div className="volunteer-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div className="volunteer-stat-content">
            <div className="volunteer-stat-label">Active Helps</div>
            <div className="volunteer-stat-value">{volunteerStats.currentActive}</div>
            <div className="volunteer-stat-change">In progress</div>
          </div>
        </div>

        <div className="volunteer-stat-card highlight">
          <div className="volunteer-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div className="volunteer-stat-content">
            <div className="volunteer-stat-label">Your Rating</div>
            <div className="volunteer-stat-value">{volunteerStats.rating}</div>
            <div className="volunteer-stat-change positive">Excellent!</div>
          </div>
        </div>

        <div className="volunteer-stat-card streak">
          <div className="volunteer-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </div>
          <div className="volunteer-stat-content">
            <div className="volunteer-stat-label">Day Streak</div>
            <div className="volunteer-stat-value">{volunteerStats.streak}</div>
            <div className="volunteer-stat-change positive">Keep it up! 🔥</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="volunteer-tabs">
        <button
          className={`volunteer-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>My Active Helps</span>
          <span className="volunteer-tab-badge">{myActiveHelps.filter(h => h.status !== 'Completed' && h.status !== 'completed').length}</span>
        </button>
        <button
          className={`volunteer-tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>Achievements</span>
        </button>
        <button
          className={`volunteer-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span>History</span>
        </button>
      </div>

      {/* Content Sections */}
      <div className="volunteer-content">
        {activeTab === 'active' && (
          <div className="volunteer-section">
            <div className="volunteer-section-header">
              <h2 className="volunteer-section-title">My Active Helps</h2>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading active helps...</div>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ef4444' }}>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>{error}</div>
              </div>
            ) : myActiveHelps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No active helps</div>
                <div style={{ fontSize: '14px' }}>Accept requests from the Help Requests page to get started</div>
              </div>
            ) : (
            <div className="volunteer-active-helps-list">
              {myActiveHelps.map(help => (
                <div key={help.id} className="volunteer-active-help-card">
                  <div className="volunteer-active-help-header">
                    <h3 className="volunteer-active-help-title">{help.title}</h3>
                    <div className={`volunteer-status-badge ${help.status.toLowerCase().replace(' ', '-')}`}>
                      {help.status}
                    </div>
                  </div>
                  <div className="volunteer-active-help-requester">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>{help.requester}</span>
                  </div>
                  {help.status === 'In Progress' && (
                    <div className="volunteer-active-help-details">
                      <div className="volunteer-detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>Accepted: {help.accepted}</span>
                      </div>
                      <div className="volunteer-detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                        <span>Est. completion: {help.estimatedCompletion}</span>
                      </div>
                      <div className="volunteer-detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        <span>{help.contact}</span>
                      </div>
                    </div>
                  )}
                  {help.status === 'Scheduled' && (
                    <div className="volunteer-active-help-details">
                      <div className="volunteer-detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>{help.scheduledTime}</span>
                      </div>
                    </div>
                  )}
                  {help.status === 'Completed' && help.rating && (
                    <div className="volunteer-active-help-completed">
                      <div className="volunteer-rating-display">
                        <div className="volunteer-stars">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i < help.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                          ))}
                        </div>
                        <span className="volunteer-rating-text">Rated {help.rating}/5</span>
                      </div>
                      {help.feedback && (
                        <div className="volunteer-feedback">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                          <span>"{help.feedback}"</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="volunteer-active-help-actions">
                    {help.status === 'In Progress' && (
                      <>
                        <button 
                          className="volunteer-action-btn primary"
                          onClick={() => alert('Chat feature coming soon!')}
                        >
                          Contact
                        </button>
                        <button 
                          className="volunteer-action-btn"
                          onClick={() => handleMarkComplete(help.id)}
                          disabled={submitting}
                        >
                          {submitting ? 'Processing...' : 'Mark Complete'}
                        </button>
                      </>
                    )}
                    {help.status === 'Scheduled' && (
                      <button 
                        className="volunteer-action-btn primary"
                        onClick={() => alert('View details feature - request ID: ' + help.id)}
                      >
                        View Details
                      </button>
                    )}
                    {help.status === 'Completed' && (
                      <button 
                        className="volunteer-action-btn"
                        onClick={() => alert('View details feature - request ID: ' + help.id)}
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="volunteer-section">
            <div className="volunteer-section-header">
              <h2 className="volunteer-section-title">Your Achievements</h2>
              <p className="volunteer-section-description">Track your volunteer milestones and unlock new badges</p>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading achievements...</div>
              </div>
            ) : (
            <div className="volunteer-achievements-grid">
              {achievements.map(achievement => (
                <div key={achievement.id} className={`volunteer-achievement-card ${achievement.earned ? 'earned' : 'locked'}`}>
                  <div className="volunteer-achievement-icon">
                    {achievement.earned ? (
                      <span className="volunteer-achievement-emoji">{achievement.icon}</span>
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    )}
                  </div>
                  <h3 className="volunteer-achievement-name">{achievement.name}</h3>
                  {achievement.earned ? (
                    <div className="volunteer-achievement-date">Earned {achievement.date}</div>
                  ) : (
                    <div className="volunteer-achievement-progress">
                      <div className="volunteer-progress-bar">
                        <div 
                          className="volunteer-progress-fill" 
                          style={{ width: `${(achievement.progress / 100) * 100}%` }}
                        ></div>
                      </div>
                      <span className="volunteer-progress-text">{achievement.progress}/100</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="volunteer-section">
            <div className="volunteer-section-header">
              <h2 className="volunteer-section-title">Volunteer History</h2>
              <p className="volunteer-section-description">Your complete volunteering journey</p>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading history...</div>
              </div>
            ) : volunteerHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(0,0,0,0.6)' }}>
                <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No history yet</div>
                <div style={{ fontSize: '14px' }}>Complete helps to see them in your history</div>
              </div>
            ) : (
            <div className="volunteer-history-list">
              {volunteerHistory.map(item => (
                <div key={item.id} className="volunteer-history-card">
                  <div className="volunteer-history-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div className="volunteer-history-content">
                    <h3 className="volunteer-history-title">{item.title}</h3>
                    <div className="volunteer-history-meta">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.hours} hours</span>
                      <span>•</span>
                      <div className="volunteer-history-rating">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.floor(item.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        ))}
                        <span>{item.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Volunteer

