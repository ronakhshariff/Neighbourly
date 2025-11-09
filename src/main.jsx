import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from 'react-oidc-context'
import ErrorBoundary from './components/ErrorBoundary'
import { COGNITO_CONFIG } from './config'
import './index.css'

// cognito config for OIDC auth (using hosted UI because it's easier)
const cognitoAuthConfig = {
  authority: COGNITO_CONFIG.authority,
  client_id: COGNITO_CONFIG.clientId,
  redirect_uri: COGNITO_CONFIG.redirectUri,
  response_type: 'code',
  scope: 'email openid profile',
  automaticSilentRenew: true, // auto refresh tokens so users don't get logged out randomly
  loadUserInfo: true
}

// try to render, if it breaks show error (better than blank screen)
try {
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('no root element found - check index.html')
  }
  
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider {...cognitoAuthConfig}>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
} catch (error) {
  // nuclear option: if everything breaks, at least show something
  console.error('app crashed:', error)
  document.body.innerHTML = `<div style="padding: 40px; color: red;"><h1>something broke</h1><pre>${error.message}\n${error.stack}</pre></div>`
}
