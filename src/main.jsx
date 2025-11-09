import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// try to render, if it breaks show error (better than blank screen)
try {
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('no root element found - check index.html')
  }
  
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <FirebaseAuthProvider>
          <App />
        </FirebaseAuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
} catch (error) {
  // nuclear option: if everything breaks, at least show something
  console.error('app crashed:', error)
  document.body.innerHTML = `<div style="padding: 40px; color: red;"><h1>something broke</h1><pre>${error.message}\n${error.stack}</pre></div>`
}
