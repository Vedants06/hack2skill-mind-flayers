import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from './firebase/config'
import Login from './components/Login'
import Signup from './components/Signup'
import './App.css'

function App() {
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Listen for authentication state changes
  useEffect(() => {
    console.log('Setting up Firebase auth listener...');
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('Auth state changed:', user);
        setUser(user)
        setLoading(false)
      })

      return () => {
        console.log('Cleaning up auth listener');
        unsubscribe()
      }
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setLoading(false);
    }
  }, [])

  const handleSectionClick = (sectionName: string) => {
    if (!user) {
      setModalMessage(`Please sign in to access ${sectionName}`);
      setShowSignInModal(true);
    } else {
      // User is authenticated, proceed with the action
      console.log(`Welcome ${user.displayName || user.email}! Accessing ${sectionName}...`)
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      console.log('User signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const closeModal = () => {
    setShowSignInModal(false);
    setShowSignupModal(false);
    setModalMessage('');
  };

  const switchToSignup = () => {
    setShowSignInModal(false)
    setShowSignupModal(true)
  }

  const switchToLogin = () => {
    setShowSignupModal(false)
    setShowSignInModal(true)
  }

  const handleAuthSuccess = () => {
    // This will be handled by the onAuthStateChanged listener
    console.log('Authentication successful!')
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  try {
    return (
      <div className="app">
        {/* Navigation Header */}
        <header className="navbar">
          <div className="nav-container">
            <div className="logo">
              <span className="logo-text">🏥 MediBuddy</span>
            </div>
            <nav className="nav-menu">
              <a href="#" className="nav-link">Home</a>
              <a href="#" className="nav-link">Services</a>
              <a href="#" className="nav-link">Find Doctors</a>
              <a href="#" className="nav-link">About us</a>
              <a href="#" className="nav-link">Blog</a>
              <a href="#" className="nav-link">Contact us</a>
            </nav>
            <div className="auth-section">
              {user ? (
                <div className="user-menu">
                  <span className="user-greeting">Hi, {user.displayName || user.email}</span>
                  <button className="signout-btn" onClick={handleSignOut}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <button className="signin-btn" onClick={() => setShowSignInModal(true)}>
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

      {/* Emergency Contact Section */}
      <section className="emergency-section">
        <div className="container">
          <div className="emergency-banner">
            <span className="emergency-icon">🚨</span>
            <span className="emergency-text">
              Medical Emergency? Call: <strong>104</strong> | 
              Emergency Helpline: <strong>108</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">
                Your <span className="highlight">trusted partner</span><br />
                in digital healthcare.
              </h1>
              <p className="hero-description">
                Empowering Your Health at Every Step. Experience personalized medical 
                care from the comfort of your home. Connect with certified doctors, or 
                manage prescriptions, and schedule appointments with ease. Ready to 
                take control of your health? Start booking an appointment today.
              </p>
              <button className="hero-cta-btn" onClick={() => handleSectionClick('appointment booking')}>
                Book an appointment
              </button>
              
              {/* Trust badges */}
              {/* <div className="trust-badges">
                <span className="trust-text">Trusted by millions across the globe</span>
                <div className="badges">
                  <div className="badge">🌐</div>
                  <div className="badge">🍎</div>
                  <div className="badge">🅲</div>
                  <div className="badge">📱</div>
                  <div className="badge">🔒</div>
                  <div className="badge">⚡</div>
                </div>
              </div> */}
            </div>
            
            <div className="hero-image">
              <div className="doctor-container">
                {/* Doctor image */}
                <img src="src/assets/docimgtemp.png" alt="Doctor" className="doctor-image" />
                
                {/* Stats overlay */}
                {/* <div className="stats-overlay">
                  <div className="stat-item">
                    <div className="stat-avatars">
                      <div className="avatar">👨‍⚕️</div>
                      <div className="avatar">👩‍⚕️</div>
                      <div className="avatar">👨‍⚕️</div>
                      <div className="avatar-count">2400+</div>
                    </div>
                    <div className="stat-text">
                      <div className="stat-title">Happy Customers</div>
                      <div className="stat-rating">⭐ (4.7 Stars)</div>
                    </div>
                  </div>
                </div> */}
                
                {/* Appointment booking badge */}
                <div className="appointment-badge">
                  <span className="badge-icon">⭐</span>
                  <span className="badge-text">Easy Appointment Booking</span>
                </div>
                
                {/* Lorem ipsum note */}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Appointment Booking Steps */}
      <section className="booking-steps-section">
        <div className="container">
          <h3 className="steps-title">Easily book an appointment in 3 simple steps.</h3>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-icon">📧</div>
              <div className="step-text">Email Address</div>
            </div>
            <div className="step-item">
              <div className="step-icon">📞</div>
              <div className="step-text">Contact Number</div>
            </div>
            <div className="step-item">
              <div className="step-icon">📅</div>
              <div className="step-text">Date of Appointment</div>
            </div>
            <button className="book-now-btn" onClick={() => handleSectionClick('appointment booking')}>
              Book Now
            </button>
          </div>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title">Top <span className="highlight">services</span> we offer</h2>
          <p className="section-subtitle">
            In today's fast-paced world, your health deserves the utmost attention and commitment. That's 
            why MediBuddy offers a suite of integrated services designed to cater to your healthcare needs digitally.
          </p>
          <div className="services-grid">
            
            {/* Report Generation */}
            <div 
              className="service-card" 
              onClick={() => handleSectionClick('Report Generation')}
            >
              <div className="service-icon">📄</div>
              <h3 className="service-title">Report Generation</h3>
              <p className="service-description">
                Upload your medical reports and get AI-powered summaries and insights. 
                Track your health trends over time.
              </p>
              <button className="service-btn">Generate Report</button>
            </div>

            {/* Doctor Appointment */}
            <div 
              className="service-card" 
              onClick={() => handleSectionClick('Doctor Appointment Booking')}
            >
              <div className="service-icon">👩‍⚕️</div>
              <h3 className="service-title">Book Appointment</h3>
              <p className="service-description">
                Schedule appointments with certified doctors across various specialties. 
                Choose your preferred time and consultation method.
              </p>
              <button className="service-btn">Book Now</button>
            </div>

            {/* Symptom Checker Chatbot */}
            <div 
              className="service-card" 
              onClick={() => handleSectionClick('Symptom Checker Chatbot')}
            >
              <div className="service-icon">🤖</div>
              <h3 className="service-title">Symptom Checker</h3>
              <p className="service-description">
                Chat with our AI-powered symptom checker to understand your health concerns 
                and get preliminary guidance.
              </p>
              <button className="service-btn">Start Chat</button>
            </div>

          </div>
        </div>
      </section>

      {/* Authentication Modals */}
      {showSignInModal && (
        <Login 
          onClose={closeModal}
          onSwitchToSignup={switchToSignup}
          onLoginSuccess={handleAuthSuccess}
        />
      )}
      
      {showSignupModal && (
        <Signup 
          onClose={closeModal}
          onSwitchToLogin={switchToLogin}
          onSignupSuccess={handleAuthSuccess}
        />
      )}
    </div>
  )
  } catch (error) {
    console.error('Error rendering app:', error);
    return (
      <div className="error-container">
        <h1>Something went wrong</h1>
        <p>Please check the console for more details.</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    )
  }
}

export default App
