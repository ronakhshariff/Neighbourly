import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext'
import burrowlyLogo from '../neighbourly_logo.PNG'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { login, signup, error: authError, loading } = useFirebaseAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    role: ''
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (isSignUp) {
        // Sign up
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setSubmitting(false)
          return
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          setSubmitting(false)
          return
        }

        await signup(formData.email, formData.password, formData.name)
        navigate('/dashboard/user')
      } else {
        // Sign in
        await login(formData.email, formData.password)
        navigate('/dashboard/user')
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-gradient-orb login-orb-1"></div>
        <div className="login-gradient-orb login-orb-2"></div>
        <div className="login-gradient-orb login-orb-3"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <img src={burrowlyLogo} alt="Burrowly Logo" />
            <span className="login-logo-text">BURROWLY</span>
          </div>

          <div className="login-header">
            <div className="login-header-glow"></div>
            <h2 className="login-title">{isSignUp ? 'Join Burrowly' : 'Welcome Back'}</h2>
            <p className="login-subtitle">
              {isSignUp 
                ? 'Start building stronger communities today' 
                : 'Sign in to continue to your dashboard'
              }
            </p>
          </div>

          <div className="login-body">
            {(error || authError) && (
              <div className="login-error-message">
                {error || authError}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              {isSignUp && (
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    placeholder="John Doe"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="john@example.com"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  minLength={6}
                />
              </div>

              {isSignUp && (
                <>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password *</label>
                    <input 
                      type="password" 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      placeholder="Confirm your password"
                      className="form-input"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input 
                      type="text" 
                      id="location" 
                      name="location" 
                      placeholder="City, State"
                      className="form-input"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">I want to</label>
                    <select 
                      id="role" 
                      name="role" 
                      className="form-select"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="">Select an option</option>
                      <option value="help">Offer help to neighbors</option>
                      <option value="need">Request help when needed</option>
                      <option value="both">Both - help and be helped</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="terms" 
                        className="form-checkbox"
                        required
                        disabled={submitting}
                      />
                      <span>I agree to the Terms of Service and Privacy Policy *</span>
                    </label>
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className="login-submit-button"
                disabled={submitting || loading}
              >
                {submitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="login-switch">
              <p>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <button 
                  type="button"
                  className="login-link"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError('')
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      location: '',
                      role: ''
                    })
                  }}
                  disabled={submitting}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            <div className="login-footer">
              <Link to="/" className="login-back-link">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
