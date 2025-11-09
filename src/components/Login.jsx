// login page - just redirects to cognito hosted UI
import React from 'react'
import { useAuth } from '../contexts/AuthContextWrapper'
import { useAuth as useOidcAuth } from 'react-oidc-context'
import './Login.css'

function Login() {
  const { login } = useAuth()
  const oidcAuth = useOidcAuth()

  const handleSignIn = () => {
    login() // this redirects to cognito
  }

  // show error if something went wrong
  if (oidcAuth.error) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>oops</h2>
          <div className="login-error">
            {oidcAuth.error.message || 'something broke'}
          </div>
          <button onClick={handleSignIn} className="login-submit">
            try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>sign in</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          click the button to go to cognito
        </p>
        
        <button 
          onClick={handleSignIn} 
          className="login-submit"
          disabled={oidcAuth.isLoading}
        >
          {oidcAuth.isLoading ? 'loading...' : 'sign in'}
        </button>

        <div className="login-switch">
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            you'll be redirected to cognito to sign in or sign up
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

