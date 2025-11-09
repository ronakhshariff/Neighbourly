import React, { useState } from 'react'
import './Roadmap.css'

function Roadmap() {
  const [activeTab, setActiveTab] = useState('businesses')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data
  const businesses = [
    {
      id: 1,
      name: 'The Accessible Café',
      category: 'Dining',
      distance: '0.3 mi',
      rating: 4.8,
      features: ['Wheelchair accessible', 'ASL-trained staff', 'Sensory-friendly hours', 'Picture menu'],
      hours: '9am-9pm',
      specialHours: 'Sensory-friendly: 9-10am Sundays',
      image: null,
      verified: true
    },
    {
      id: 2,
      name: 'Community Health Center',
      category: 'Medical',
      distance: '0.8 mi',
      rating: 4.9,
      features: ['Accessible parking', 'Elevator access', 'Large print materials', 'Online booking'],
      hours: '8am-6pm',
      specialHours: null,
      image: null,
      verified: true
    },
    {
      id: 3,
      name: 'Downtown Cinema',
      category: 'Entertainment',
      distance: '1.2 mi',
      rating: 4.6,
      features: ['Wheelchair accessible', 'Audio description', 'Closed captions', 'Access2 card accepted'],
      hours: '12pm-11pm',
      specialHours: 'Accessible screenings: Tuesdays 2pm',
      image: null,
      verified: true
    }
  ]

  const transportation = [
    {
      id: 1,
      type: 'Calgary Transit Access',
      description: 'Door-to-door accessible transit service',
      eligibility: 'Requires application',
      rating: 4.5,
      features: ['Wheelchair accessible vehicles', 'Door-to-door service', 'Advance booking'],
      link: '#'
    },
    {
      id: 2,
      type: 'Volunteer Ride Program',
      description: 'Community volunteers provide rides',
      eligibility: 'Open to all',
      rating: 4.9,
      features: ['Free service', 'Flexible scheduling', 'Community-based'],
      link: '#'
    },
    {
      id: 3,
      type: 'Accessible Taxi Service',
      description: '24/7 accessible taxi service',
      eligibility: 'No application needed',
      rating: 4.3,
      features: ['Wheelchair accessible', '24/7 availability', 'App booking'],
      link: '#'
    }
  ]

  const pathfinders = [
    {
      id: 1,
      title: 'How to get a medical ride',
      steps: [
        { number: 1, text: 'Fill out the Access application form', link: '#' },
        { number: 2, text: 'Upload photo ID and medical documentation', link: '#' },
        { number: 3, text: 'Wait for approval (usually 2-3 weeks)', link: '#' },
        { number: 4, text: 'Book your first ride through the app', link: '#' }
      ],
      icon: 'medical',
      estimatedTime: '2-3 weeks'
    },
    {
      id: 2,
      title: 'How to get a support animal card',
      steps: [
        { number: 1, text: 'Get a letter from your healthcare provider', link: '#' },
        { number: 2, text: 'Complete the support animal registration form', link: '#' },
        { number: 3, text: 'Submit documentation and pay fee', link: '#' },
        { number: 4, text: 'Receive your card in the mail', link: '#' }
      ],
      icon: 'card',
      estimatedTime: '4-6 weeks'
    },
    {
      id: 3,
      title: 'How to sign up for low-income housing',
      steps: [
        { number: 1, text: 'Check eligibility requirements', link: '#' },
        { number: 2, text: 'Gather required documents (ID, income proof, etc.)', link: '#' },
        { number: 3, text: 'Submit application online or in person', link: '#' },
        { number: 4, text: 'Join the waitlist and wait for availability', link: '#' }
      ],
      icon: 'housing',
      estimatedTime: 'Varies'
    }
  ]

  const deals = [
    {
      id: 1,
      business: 'The Accessible Café',
      title: '2-for-1 Entry for Support Workers',
      description: 'Support workers get free entry when accompanying a person with disabilities',
      validUntil: '2025-12-31',
      category: 'Dining'
    },
    {
      id: 2,
      business: 'Community Garden',
      title: 'Free Delivery for Mobility-Limited Seniors',
      description: 'Free grocery delivery for seniors with mobility limitations',
      validUntil: 'Ongoing',
      category: 'Community'
    },
    {
      id: 3,
      business: 'Eco-Friendly Store',
      title: 'Plastic-Free Kits for Vulnerable Residents',
      description: 'Free reusable kits for low-income residents',
      validUntil: '2025-06-30',
      category: 'Sustainability'
    }
  ]

  const supportServices = [
    {
      id: 1,
      name: 'Autism Calgary',
      type: 'Nonprofit',
      services: ['Support groups', 'Resource library', 'Advocacy'],
      contact: 'info@autismcalgary.com',
      phone: '(403) 205-5669'
    },
    {
      id: 2,
      name: 'CNIB Foundation',
      type: 'Nonprofit',
      services: ['Vision rehabilitation', 'Technology training', 'Peer support'],
      contact: 'calgary@cnib.ca',
      phone: '(403) 261-7210'
    },
    {
      id: 3,
      name: 'Community Support Workers',
      type: 'Service',
      services: ['Personal care', 'Companionship', 'Transportation'],
      contact: 'support@burrowly.ca',
      phone: '(403) 555-0123'
    }
  ]

  const categories = ['all', 'Dining', 'Medical', 'Entertainment', 'Shopping', 'Services']

  return (
    <div className="roadmap-container">
      <div className="roadmap-header">
        <div className="roadmap-header-content">
          <div className="roadmap-header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3zM7 7h10M7 12h10M7 17h6"/>
            </svg>
          </div>
          <div>
            <h1 className="roadmap-title">Roadmap</h1>
            <p className="roadmap-subtitle">Your Inclusive Access Navigator</p>
          </div>
        </div>
        <div className="roadmap-search-container">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search businesses, services, or resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="roadmap-search-input"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="roadmap-tabs">
        <button
          className={`roadmap-tab ${activeTab === 'businesses' ? 'active' : ''}`}
          onClick={() => setActiveTab('businesses')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>Businesses</span>
        </button>
        <button
          className={`roadmap-tab ${activeTab === 'transportation' ? 'active' : ''}`}
          onClick={() => setActiveTab('transportation')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16l-4 4-4-4h-9z"/>
            <path d="M12 17v-6"/>
            <path d="M9 14l3 3 3-3"/>
          </svg>
          <span>Transportation</span>
        </button>
        <button
          className={`roadmap-tab ${activeTab === 'pathfinder' ? 'active' : ''}`}
          onClick={() => setActiveTab('pathfinder')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span>Pathfinder</span>
        </button>
        <button
          className={`roadmap-tab ${activeTab === 'deals' ? 'active' : ''}`}
          onClick={() => setActiveTab('deals')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span>Deals & Initiatives</span>
        </button>
        <button
          className={`roadmap-tab ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Support Services</span>
        </button>
      </div>

      {/* Content Sections */}
      <div className="roadmap-content">
        {activeTab === 'businesses' && (
          <div className="roadmap-section">
            <div className="roadmap-section-header">
              <h2 className="roadmap-section-title">Accessible Businesses</h2>
              <div className="roadmap-filters">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`roadmap-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="roadmap-businesses-grid">
              {businesses.map(business => (
                <div key={business.id} className="roadmap-business-card">
                  <div className="roadmap-business-header">
                    <div className="roadmap-business-info">
                      <h3 className="roadmap-business-name">{business.name}</h3>
                      <div className="roadmap-business-meta">
                        <span className="roadmap-business-category">{business.category}</span>
                        <span className="roadmap-business-distance">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {business.distance}
                        </span>
                      </div>
                    </div>
                    {business.verified && (
                      <div className="roadmap-verified-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="roadmap-business-rating">
                    <div className="roadmap-stars">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < Math.floor(business.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                    </div>
                    <span className="roadmap-rating-value">{business.rating}</span>
                  </div>
                  <div className="roadmap-business-features">
                    {business.features.map((feature, idx) => (
                      <div key={idx} className="roadmap-feature-tag">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="roadmap-business-hours">
                    <div className="roadmap-hours-main">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>Hours: {business.hours}</span>
                    </div>
                    {business.specialHours && (
                      <div className="roadmap-hours-special">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                        <span>{business.specialHours}</span>
                      </div>
                    )}
                  </div>
                  <button className="roadmap-business-btn">View Details</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'transportation' && (
          <div className="roadmap-section">
            <div className="roadmap-section-header">
              <h2 className="roadmap-section-title">Accessible Transportation</h2>
              <p className="roadmap-section-description">Find transportation options that work for you</p>
            </div>
            <div className="roadmap-transportation-grid">
              {transportation.map(service => (
                <div key={service.id} className="roadmap-transport-card">
                  <div className="roadmap-transport-header">
                    <div className="roadmap-transport-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16l-4 4-4-4h-9z"/>
                      </svg>
                    </div>
                    <div className="roadmap-transport-rating">
                      <div className="roadmap-stars">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.floor(service.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        ))}
                      </div>
                      <span>{service.rating}</span>
                    </div>
                  </div>
                  <h3 className="roadmap-transport-name">{service.type}</h3>
                  <p className="roadmap-transport-description">{service.description}</p>
                  <div className="roadmap-transport-eligibility">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span>{service.eligibility}</span>
                  </div>
                  <div className="roadmap-transport-features">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="roadmap-feature-mini">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button className="roadmap-transport-btn">Learn More</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pathfinder' && (
          <div className="roadmap-section">
            <div className="roadmap-section-header">
              <h2 className="roadmap-section-title">Pathfinder Tools</h2>
              <p className="roadmap-section-description">Step-by-step guides to help you navigate services</p>
            </div>
            <div className="roadmap-pathfinder-grid">
              {pathfinders.map(path => (
                <div key={path.id} className="roadmap-pathfinder-card">
                  <div className="roadmap-pathfinder-header">
                    <div className="roadmap-pathfinder-icon-wrapper">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                    <div className="roadmap-pathfinder-time">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>{path.estimatedTime}</span>
                    </div>
                  </div>
                  <h3 className="roadmap-pathfinder-title">{path.title}</h3>
                  <div className="roadmap-pathfinder-steps">
                    {path.steps.map((step, idx) => (
                      <div key={idx} className="roadmap-step-item">
                        <div className="roadmap-step-number">{step.number}</div>
                        <div className="roadmap-step-content">
                          <p className="roadmap-step-text">{step.text}</p>
                          {step.link && (
                            <a href={step.link} className="roadmap-step-link">
                              View form <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                                <polyline points="12 5 19 12 12 19"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="roadmap-pathfinder-btn">Start This Process</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="roadmap-section">
            <div className="roadmap-section-header">
              <h2 className="roadmap-section-title">Inclusive Deals & Initiatives</h2>
              <p className="roadmap-section-description">Special offers and community programs</p>
            </div>
            <div className="roadmap-deals-grid">
              {deals.map(deal => (
                <div key={deal.id} className="roadmap-deal-card">
                  <div className="roadmap-deal-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <span>Special Offer</span>
                  </div>
                  <div className="roadmap-deal-category">{deal.category}</div>
                  <h3 className="roadmap-deal-title">{deal.title}</h3>
                  <p className="roadmap-deal-business">{deal.business}</p>
                  <p className="roadmap-deal-description">{deal.description}</p>
                  <div className="roadmap-deal-footer">
                    <div className="roadmap-deal-validity">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>Valid until {deal.validUntil}</span>
                    </div>
                    <button className="roadmap-deal-btn">Claim Offer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="roadmap-section">
            <div className="roadmap-section-header">
              <h2 className="roadmap-section-title">Support Services & Resources</h2>
              <p className="roadmap-section-description">Connect with organizations that can help</p>
            </div>
            <div className="roadmap-support-grid">
              {supportServices.map(service => (
                <div key={service.id} className="roadmap-support-card">
                  <div className="roadmap-support-header">
                    <div className="roadmap-support-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div className="roadmap-support-type">{service.type}</div>
                  </div>
                  <h3 className="roadmap-support-name">{service.name}</h3>
                  <div className="roadmap-support-services">
                    {service.services.map((srv, idx) => (
                      <div key={idx} className="roadmap-service-tag">
                        <span>{srv}</span>
                      </div>
                    ))}
                  </div>
                  <div className="roadmap-support-contact">
                    <div className="roadmap-contact-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <span>{service.contact}</span>
                    </div>
                    <div className="roadmap-contact-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span>{service.phone}</span>
                    </div>
                  </div>
                  <button className="roadmap-support-btn">Contact</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Access ID Integration Banner */}
      <div className="roadmap-access-banner">
        <div className="roadmap-access-banner-content">
          <div className="roadmap-access-banner-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="roadmap-access-banner-text">
            <h3>Access ID Integration</h3>
            <p>Link your Access2, Compass, or eligibility card to unlock special features and verified access</p>
          </div>
          <button className="roadmap-access-banner-btn">Connect Your Card</button>
        </div>
      </div>
    </div>
  )
}

export default Roadmap

