import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { cityAPI } from '../services/api'
import './CityAuthorityVerification.css'

function CityAuthorityVerification({ onVerified }) {
  const { user } = useApp()
  const [showModal, setShowModal] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [verificationData, setVerificationData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    organization: '',
    department: '',
    position: '',
    employeeId: '',
    governmentEmail: '',
    phoneNumber: '',
    documents: null,
    reason: ''
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setVerificationData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          documents: 'File size must be less than 5MB'
        }))
        return
      }
      setVerificationData(prev => ({
        ...prev,
        documents: file
      }))
      setErrors(prev => ({
        ...prev,
        documents: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!verificationData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    if (!verificationData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(verificationData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!verificationData.organization.trim()) {
      newErrors.organization = 'Organization is required'
    }
    if (!verificationData.department.trim()) {
      newErrors.department = 'Department is required'
    }
    if (!verificationData.position.trim()) {
      newErrors.position = 'Position is required'
    }
    if (!verificationData.governmentEmail.trim()) {
      newErrors.governmentEmail = 'Government email is required'
    } else if (!/\S+@\S+\.\S+/.test(verificationData.governmentEmail)) {
      newErrors.governmentEmail = 'Government email is invalid'
    }
    if (!verificationData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    }
    if (!verificationData.reason.trim()) {
      newErrors.reason = 'Please explain why you need access'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('fullName', verificationData.fullName)
      formData.append('email', verificationData.email)
      formData.append('organization', verificationData.organization)
      formData.append('department', verificationData.department)
      formData.append('position', verificationData.position)
      formData.append('employeeId', verificationData.employeeId)
      formData.append('governmentEmail', verificationData.governmentEmail)
      formData.append('phoneNumber', verificationData.phoneNumber)
      formData.append('reason', verificationData.reason)
      if (verificationData.documents) {
        formData.append('documents', verificationData.documents)
      }

      await cityAPI.requestCityAuthorityVerification(formData)
      
      setSuccess(true)
      setTimeout(() => {
        setShowModal(false)
        if (onVerified) {
          onVerified()
        }
      }, 2000)
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to submit verification request' })
      console.error('Error submitting verification:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!showModal) return null

  if (success) {
    return (
      <div className="city-verification-overlay">
        <div className="city-verification-modal">
          <div className="city-verification-success">
            <div className="city-verification-success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2>Verification Request Submitted</h2>
            <p>Your request has been submitted successfully. Our team will review your application and notify you via email within 2-3 business days.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="city-verification-overlay">
      <div className="city-verification-modal">
        <div className="city-verification-header">
          <div className="city-verification-header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <h2 className="city-verification-title">City Authority Verification Required</h2>
            <p className="city-verification-subtitle">Please verify your identity to access the City Authorities Dashboard</p>
          </div>
        </div>

        <form className="city-verification-form" onSubmit={handleSubmit}>
          <div className="city-verification-section">
            <h3 className="city-verification-section-title">Personal Information</h3>
            
            <div className="city-verification-form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={verificationData.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? 'error' : ''}
                placeholder="John Doe"
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="city-verification-form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={verificationData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="john.doe@example.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="city-verification-form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={verificationData.phoneNumber}
                onChange={handleInputChange}
                className={errors.phoneNumber ? 'error' : ''}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
            </div>
          </div>

          <div className="city-verification-section">
            <h3 className="city-verification-section-title">Government Information</h3>
            
            <div className="city-verification-form-group">
              <label htmlFor="organization">Organization/Department *</label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={verificationData.organization}
                onChange={handleInputChange}
                className={errors.organization ? 'error' : ''}
                placeholder="City of Calgary"
              />
              {errors.organization && <span className="error-message">{errors.organization}</span>}
            </div>

            <div className="city-verification-form-group">
              <label htmlFor="department">Department/Division *</label>
              <input
                type="text"
                id="department"
                name="department"
                value={verificationData.department}
                onChange={handleInputChange}
                className={errors.department ? 'error' : ''}
                placeholder="Emergency Management"
              />
              {errors.department && <span className="error-message">{errors.department}</span>}
            </div>

            <div className="city-verification-form-group">
              <label htmlFor="position">Position/Title *</label>
              <input
                type="text"
                id="position"
                name="position"
                value={verificationData.position}
                onChange={handleInputChange}
                className={errors.position ? 'error' : ''}
                placeholder="Emergency Coordinator"
              />
              {errors.position && <span className="error-message">{errors.position}</span>}
            </div>

            <div className="city-verification-form-group">
              <label htmlFor="employeeId">Employee ID (Optional)</label>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={verificationData.employeeId}
                onChange={handleInputChange}
                placeholder="EMP-12345"
              />
            </div>

            <div className="city-verification-form-group">
              <label htmlFor="governmentEmail">Government Email *</label>
              <input
                type="email"
                id="governmentEmail"
                name="governmentEmail"
                value={verificationData.governmentEmail}
                onChange={handleInputChange}
                className={errors.governmentEmail ? 'error' : ''}
                placeholder="john.doe@calgary.ca"
              />
              {errors.governmentEmail && <span className="error-message">{errors.governmentEmail}</span>}
              <small className="form-hint">Must be an official government email address</small>
            </div>
          </div>

          <div className="city-verification-section">
            <h3 className="city-verification-section-title">Verification Documents</h3>
            
            <div className="city-verification-form-group">
              <label htmlFor="documents">Upload Verification Document (Optional)</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="documents"
                  name="documents"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="file-input"
                />
                <label htmlFor="documents" className="file-upload-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  {verificationData.documents ? verificationData.documents.name : 'Choose file or drag here'}
                </label>
              </div>
              {errors.documents && <span className="error-message">{errors.documents}</span>}
              <small className="form-hint">PDF, JPG, or PNG (max 5MB). ID badge, employment letter, or official document.</small>
            </div>

            <div className="city-verification-form-group">
              <label htmlFor="reason">Reason for Access *</label>
              <textarea
                id="reason"
                name="reason"
                value={verificationData.reason}
                onChange={handleInputChange}
                className={errors.reason ? 'error' : ''}
                placeholder="Please explain why you need access to the City Authorities Dashboard..."
                rows="4"
              />
              {errors.reason && <span className="error-message">{errors.reason}</span>}
            </div>
          </div>

          {errors.submit && (
            <div className="city-verification-error-banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errors.submit}
            </div>
          )}

          <div className="city-verification-actions">
            <button
              type="button"
              className="city-verification-btn-secondary"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="city-verification-btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Verification Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CityAuthorityVerification

