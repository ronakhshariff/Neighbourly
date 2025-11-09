import React, { useState } from 'react'
import { helpRequests, myRequests } from '../data/mockData'
import './UserDashboard.css'

function UserDashboard() {
  const [showRequestForm, setShowRequestForm] = useState(false)

  // Use shared data - show first 3 nearby requests
  const nearbyRequests = helpRequests.slice(0, 3)

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
            <div className="user-stat-mini-value">12</div>
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
            <div className="user-stat-mini-value">3</div>
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
            <div className="user-stat-mini-value">24</div>
            <div className="user-stat-mini-label">Helps Completed</div>
          </div>
        </div>
      </div>

      <div className="user-dashboard-grid">
        {/* Nearby Requests */}
        <div className="user-dashboard-card">
          <div className="user-card-header">
            <h2 className="user-card-title">Nearby Help Requests</h2>
            <button className="user-card-action">View Map</button>
          </div>
          <div className="user-requests-list">
            {nearbyRequests.map(request => (
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
                <button className="user-btn-accept">Accept Request</button>
              </div>
            ))}
          </div>
        </div>

        {/* My Requests */}
        <div className="user-dashboard-card">
          <div className="user-card-header">
            <h2 className="user-card-title">My Requests</h2>
            <button className="user-card-action">View All</button>
          </div>
          <div className="user-my-requests-list">
            {myRequests.map(request => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="user-dashboard-card full-width">
        <div className="user-card-header">
          <h2 className="user-card-title">Quick Actions</h2>
        </div>
        <div className="user-quick-actions">
          <button className="user-quick-action-btn">
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
          <button className="user-quick-action-btn">
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
          <button className="user-quick-action-btn">
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
          <button className="user-quick-action-btn">
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
              <form className="user-request-form">
                <div className="user-form-group">
                  <label>Title</label>
                  <input type="text" placeholder="Brief description of what you need" />
                </div>
                <div className="user-form-group">
                  <label>Description</label>
                  <textarea rows="4" placeholder="Tell us more about your request..."></textarea>
                </div>
                <div className="user-form-group">
                  <label>Category</label>
                  <select>
                    <option>Select category</option>
                    <option>Accessibility</option>
                    <option>Medical</option>
                    <option>Safety</option>
                    <option>Community</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="user-form-group">
                  <label>Location</label>
                  <input type="text" placeholder="Your address or area" />
                </div>
                <div className="user-form-actions">
                  <button type="button" className="user-btn-cancel" onClick={() => setShowRequestForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="user-btn-submit">
                    Submit Request
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

