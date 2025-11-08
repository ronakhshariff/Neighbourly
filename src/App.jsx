import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState('normal')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleHighContrast = () => {
    setHighContrast(!highContrast)
    document.documentElement.classList.toggle('high-contrast', !highContrast)
  }

  const changeFontSize = (size) => {
    setFontSize(size)
    document.documentElement.setAttribute('data-font-size', size)
  }

  return (
    <div className={`app ${highContrast ? 'high-contrast' : ''}`} data-font-size={fontSize}>
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 5L25 15H35L27 22L29 32L20 27L11 32L13 22L5 15H15L20 5Z" fill="currentColor"/>
              </svg>
              <span className="logo-text">Neighbourly</span>
            </div>
            <div className="nav-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#impact">Impact</a>
              <button className="btn-primary">Get Started</button>
            </div>
            <div className="accessibility-controls">
              <button 
                onClick={toggleHighContrast}
                className="accessibility-btn"
                aria-label="Toggle high contrast mode"
                title="High Contrast"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 2V18M2 10H18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              <div className="font-size-controls">
                <button 
                  onClick={() => changeFontSize('small')}
                  className="font-btn"
                  aria-label="Small text size"
                >
                  A
                </button>
                <button 
                  onClick={() => changeFontSize('normal')}
                  className="font-btn active"
                  aria-label="Normal text size"
                >
                  A
                </button>
                <button 
                  onClick={() => changeFontSize('large')}
                  className="font-btn"
                  aria-label="Large text size"
                >
                  A
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="gradient-overlay"></div>
          <div className="pattern-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🤝</span>
              <span>AI-Powered Community Resilience</span>
            </div>
            <h1 className="hero-title">
              Building Safer, More Inclusive, and Resilient Communities
            </h1>
            <p className="hero-description">
              Neighbourly connects people in need with nearby helpers, using AI to ensure no one is left behind. 
              Together, we're creating neighborhoods where everyone belongs and thrives.
            </p>
            <div className="hero-actions">
              <button className="btn-primary btn-large">
                Join Your Neighborhood
              </button>
              <button className="btn-secondary btn-large">
                Learn More
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">70%</div>
                <div className="stat-label">Urban Population by 2050</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">700M+</div>
                <div className="stat-label">Urban Residents with Disabilities</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">80-90%</div>
                <div className="stat-label">Life-Saving Rescues by Neighbors</div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">🦽</div>
            <div className="card-text">Accessibility Help</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">🌡️</div>
            <div className="card-text">Emergency Support</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">🤝</div>
            <div className="card-text">Community Tasks</div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="problem-section">
        <div className="container">
          <div className="section-header">
            <h2>The Challenge</h2>
            <p className="section-subtitle">
              Our cities face unprecedented challenges that affect us all
            </p>
          </div>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon">🏙️</div>
              <h3>Rapid Urbanization</h3>
              <p>Over half the world's people live in cities, rising to ~70% by 2050. Infrastructure struggles to keep pace with growth.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">♿</div>
              <h3>Accessibility Gaps</h3>
              <p>Over 700 million urban residents with disabilities face daily barriers. Cities often aren't designed for everyone.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">🌡️</div>
              <h3>Climate & Safety</h3>
              <p>91% of urban populations breathe unsafe air. Disasters disrupt services, and professional responders can't reach everyone in time.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">👥</div>
              <h3>Community Disconnection</h3>
              <p>Vulnerable groups struggle to access services. During emergencies, neighbors often provide 80-90% of life-saving rescues.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="solution-section">
        <div className="container">
          <div className="section-header">
            <h2>How Neighbourly Works</h2>
            <p className="section-subtitle">
              AI-powered technology that connects neighbors when help is needed most
            </p>
          </div>
          <div className="solution-grid">
            <div className="solution-card featured">
              <div className="solution-number">01</div>
              <div className="solution-icon">📱</div>
              <h3>Request Help Instantly</h3>
              <p>Post a request with voice, text, or photo. AI automatically categorizes and prioritizes your need, ensuring urgent requests get attention first.</p>
              <ul className="feature-list">
                <li>✓ Voice-to-text input</li>
                <li>✓ Photo recognition</li>
                <li>✓ Multi-language support</li>
                <li>✓ Smart prioritization</li>
              </ul>
            </div>
            <div className="solution-card">
              <div className="solution-number">02</div>
              <div className="solution-icon">🗺️</div>
              <h3>Real-Time Community Feed</h3>
              <p>Volunteers see nearby requests on an interactive map and live feed. AI translates requests to your preferred language automatically.</p>
              <ul className="feature-list">
                <li>✓ Interactive map view</li>
                <li>✓ Distance calculation</li>
                <li>✓ Real-time updates</li>
                <li>✓ Language translation</li>
              </ul>
            </div>
            <div className="solution-card">
              <div className="solution-number">03</div>
              <div className="solution-icon">🤝</div>
              <h3>Connect & Help</h3>
              <p>Accept a request and connect directly. Built-in chat with translation ensures clear communication, regardless of language barriers.</p>
              <ul className="feature-list">
                <li>✓ Instant notifications</li>
                <li>✓ Secure messaging</li>
                <li>✓ Real-time translation</li>
                <li>✓ Status tracking</li>
              </ul>
            </div>
            <div className="solution-card">
              <div className="solution-number">04</div>
              <div className="solution-icon">🤖</div>
              <h3>AI-Powered Insights</h3>
              <p>City officials get AI-analyzed dashboards showing hotspots, trends, and at-risk areas during emergencies for better resource allocation.</p>
              <ul className="feature-list">
                <li>✓ Predictive analytics</li>
                <li>✓ Heatmap visualization</li>
                <li>✓ Trend analysis</li>
                <li>✓ Emergency coordination</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2>Real-World Scenarios</h2>
            <p className="section-subtitle">
              See how Neighbourly makes a difference in everyday life
            </p>
          </div>
          <div className="scenario-grid">
            <div className="scenario-card">
              <div className="scenario-header">
                <div className="scenario-avatar">👵</div>
                <div>
                  <h4>Maria, 78</h4>
                  <p className="scenario-role">Elderly Resident</p>
                </div>
              </div>
              <div className="scenario-content">
                <p className="scenario-quote">
                  "During a heatwave, I felt dizzy and needed water. I spoke into Neighbourly, and within 3 minutes, my neighbor John was at my door with help."
                </p>
                <div className="scenario-features">
                  <span className="tag">Voice Input</span>
                  <span className="tag">Urgent Priority</span>
                  <span className="tag">3-Min Response</span>
                </div>
              </div>
            </div>
            <div className="scenario-card">
              <div className="scenario-header">
                <div className="scenario-avatar">🦽</div>
                <div>
                  <h4>Alex</h4>
                  <p className="scenario-role">Wheelchair User</p>
                </div>
              </div>
              <div className="scenario-content">
                <p className="scenario-quote">
                  "I reported a broken elevator and snow-blocked ramp. The AI flagged it as high priority, and a volunteer helped clear the path within 15 minutes."
                </p>
                <div className="scenario-features">
                  <span className="tag">Photo Upload</span>
                  <span className="tag">AI Categorization</span>
                  <span className="tag">Accessibility</span>
                </div>
              </div>
            </div>
            <div className="scenario-card">
              <div className="scenario-header">
                <div className="scenario-avatar">🌍</div>
                <div>
                  <h4>Carlos</h4>
                  <p className="scenario-role">New Resident</p>
                </div>
              </div>
              <div className="scenario-content">
                <p className="scenario-quote">
                  "I posted a request in Spanish, and it was automatically translated. An English-speaking neighbor responded, and we communicated seamlessly through the app."
                </p>
                <div className="scenario-features">
                  <span className="tag">Multi-Language</span>
                  <span className="tag">Auto Translation</span>
                  <span className="tag">Inclusive</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="impact-section">
        <div className="container">
          <div className="section-header">
            <h2>Measurable Impact</h2>
            <p className="section-subtitle">
              Building resilient communities, one connection at a time
            </p>
          </div>
          <div className="impact-grid">
            <div className="impact-card">
              <div className="impact-icon">⚡</div>
              <div className="impact-number">3 min</div>
              <div className="impact-label">Average Response Time</div>
              <p>Urgent requests get help faster than traditional emergency services in many cases</p>
            </div>
            <div className="impact-card">
              <div className="impact-icon">🌍</div>
              <div className="impact-number">15+</div>
              <div className="impact-label">Languages Supported</div>
              <p>AI translation breaks down language barriers, making help accessible to everyone</p>
            </div>
            <div className="impact-card">
              <div className="impact-icon">♿</div>
              <div className="impact-number">100%</div>
              <div className="impact-label">Accessible Design</div>
              <p>Built with accessibility first - screen readers, high contrast, voice input, and more</p>
            </div>
            <div className="impact-card">
              <div className="impact-icon">🤝</div>
              <div className="impact-number">95%</div>
              <div className="impact-label">User Satisfaction</div>
              <p>Users report feeling safer and more connected to their communities</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Build a Stronger Community?</h2>
            <p>Join Neighbourly today and be part of creating safer, more inclusive, and resilient neighborhoods.</p>
            <div className="cta-actions">
              <button className="btn-primary btn-large">Get Started Free</button>
              <button className="btn-secondary btn-large">See How It Works</button>
            </div>
            <div className="cta-features">
              <div className="cta-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>100% Free to Use</span>
              </div>
              <div className="cta-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>No Credit Card Required</span>
              </div>
              <div className="cta-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Available on All Devices</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                  <path d="M20 5L25 15H35L27 22L29 32L20 27L11 32L13 22L5 15H15L20 5Z" fill="currentColor"/>
                </svg>
                <span className="logo-text">Neighbourly</span>
              </div>
              <p>Building safer, more inclusive, and resilient communities through AI-powered neighborly connections.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#impact">Impact</a>
                <a href="#">Pricing</a>
              </div>
              <div className="footer-column">
                <h4>Resources</h4>
                <a href="#">Documentation</a>
                <a href="#">Community</a>
                <a href="#">Blog</a>
                <a href="#">Support</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Careers</a>
                <a href="#">Contact</a>
                <a href="#">Privacy</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Neighbourly. All rights reserved.</p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter">Twitter</a>
              <a href="#" aria-label="LinkedIn">LinkedIn</a>
              <a href="#" aria-label="GitHub">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

