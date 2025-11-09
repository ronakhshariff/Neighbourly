import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './DashboardLayout.css'
import burrowlyLogo from '../neighbourly_logo.PNG'

function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useApp()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showA11ySettings, setShowA11ySettings] = useState(false)

  const handleLogout = async () => {
    try {
      // Clear all auth data
      localStorage.clear()
      sessionStorage.clear()
      
      // Logout from Firebase
      const result = await logout()
      
      // Navigate to home page
      navigate('/', { replace: true })
      
      // Force page reload to clear all state and ensure clean logout
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error('Error logging out:', error)
      // Even if logout fails, clear storage and redirect
      localStorage.clear()
      sessionStorage.clear()
      navigate('/', { replace: true })
      window.location.reload()
    }
  }

  // Get user display info
  const displayUser = user || {
    name: 'Guest User',
    email: 'guest@example.com',
    role: location.pathname.includes('/city') ? 'city' : 'user',
    avatar: null
  }

  const isCityView = location.pathname.includes('/city')
  const isUserView = location.pathname.includes('/user')

  return (
    <div className="dashboard-layout">
      {/* Top Navigation Bar */}
      <nav className="dashboard-navbar">
        <div className="dashboard-nav-container">
          <Link to={isCityView ? '/dashboard/city' : '/dashboard/user'} className="dashboard-logo">
            <div className="dashboard-logo-icon">
              <img src={burrowlyLogo} alt="Burrowly Logo" />
            </div>
            <span className="dashboard-logo-text">BURROWLY</span>
          </Link>

          <div className="dashboard-nav-center">
            <div className="dashboard-view-toggle">
              <button
                className={`dashboard-view-toggle-btn ${isUserView ? 'active' : ''}`}
                onClick={() => navigate('/dashboard/user')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Community</span>
              </button>
              <button
                className={`dashboard-view-toggle-btn ${isCityView ? 'active' : ''}`}
                onClick={() => navigate('/dashboard/city')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>City Authorities</span>
              </button>
            </div>
          </div>

          <div className="dashboard-nav-actions">
            <button 
              className="dashboard-settings-btn"
              onClick={() => setShowA11ySettings(!showA11ySettings)}
              aria-label="Accessibility settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
              </svg>
            </button>

            <div className="dashboard-user-menu" style={{ position: 'relative' }}>
              <button 
                className="dashboard-user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="dashboard-user-avatar">
                  {displayUser.avatar ? (
                    <img src={displayUser.avatar} alt={displayUser.name} />
                  ) : (
                    <span>{displayUser.name.charAt(0)}</span>
                  )}
                </div>
                <span className="dashboard-user-name">{displayUser.name}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {showUserMenu && (
                <div className="dashboard-user-dropdown">
                  <div className="dashboard-user-dropdown-header">
                    <div className="dashboard-user-dropdown-avatar">
                      {displayUser.avatar ? (
                        <img src={displayUser.avatar} alt={displayUser.name} />
                      ) : (
                        <span>{displayUser.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className="dashboard-user-dropdown-name">{displayUser.name}</div>
                      <div className="dashboard-user-dropdown-email">{displayUser.email}</div>
                    </div>
                  </div>
                  <div className="dashboard-user-dropdown-divider"></div>
                  <Link to="/dashboard/user/profile" className="dashboard-user-dropdown-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>Profile</span>
                  </Link>
                  <Link to="/dashboard/user/settings" className="dashboard-user-dropdown-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
                    </svg>
                    <span>Settings</span>
                  </Link>
                  <div className="dashboard-user-dropdown-divider"></div>
                  <button onClick={handleLogout} className="dashboard-user-dropdown-item logout">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-content-wrapper">
        {/* Sidebar Navigation */}
        <aside className="dashboard-sidebar">
          <nav className="dashboard-sidebar-nav">
            {isCityView ? (
              <>
                <Link 
                  to="/dashboard/city" 
                  className={`dashboard-nav-item ${location.pathname === '/dashboard/city' ? 'active' : ''}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/dashboard/city/requests" 
                  className={`dashboard-nav-item ${location.pathname.includes('/requests') ? 'active' : ''}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>Help Requests</span>
                  <span className="dashboard-nav-badge">12</span>
                </Link>
                <Link 
                  to="/dashboard/city/verification" 
                  className={`dashboard-nav-item ${location.pathname.includes('/verification') ? 'active' : ''}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>Verification</span>
                  <span className="dashboard-nav-badge pending">3</span>
                </Link>
                <Link 
                  to="/dashboard/city/analytics" 
                  className={`dashboard-nav-item ${location.pathname.includes('/analytics') ? 'active' : ''}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                  <span>Analytics</span>
                </Link>
                <Link 
                  to="/dashboard/city/roadmap" 
                  className={`dashboard-nav-item ${location.pathname.includes('/roadmap') ? 'active' : ''}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h18v18H3zM7 7h10M7 12h10M7 17h6"/>
                  </svg>
                  <span>Roadmap</span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/dashboard/user" 
                  className={`dashboard-nav-item ${location.pathname === '/dashboard/user' ? 'active' : ''}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span>Home</span>
                </Link>
                <Link 
                  to="/dashboard/user/requests" 
                  className={`dashboard-nav-item ${location.pathname.includes('/requests') ? 'active' : ''}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>Help Requests</span>
                </Link>
                <Link 
                  to="/dashboard/user/map" 
                  className={`dashboard-nav-item ${location.pathname.includes('/map') ? 'active' : ''}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>Map View</span>
                </Link>
                <Link 
                  to="/dashboard/user/roadmap" 
                  className={`dashboard-nav-item ${location.pathname.includes('/roadmap') ? 'active' : ''}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h18v18H3zM7 7h10M7 12h10M7 17h6"/>
                  </svg>
                  <span>Roadmap</span>
                </Link>
                <Link 
                  to="/dashboard/user/volunteer" 
                  className={`dashboard-nav-item ${location.pathname.includes('/volunteer') ? 'active' : ''}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span>Volunteer</span>
                </Link>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

