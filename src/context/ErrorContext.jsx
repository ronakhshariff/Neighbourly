import React, { createContext, useContext, useState, useCallback } from 'react'
import ErrorNotification from '../components/ErrorNotification'

const ErrorContext = createContext()

export const useError = () => {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within ErrorProvider')
  }
  return context
}

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null)

  const showError = useCallback((errorMessage, details = null) => {
    const errorObj = typeof errorMessage === 'string' 
      ? { message: errorMessage, details }
      : errorMessage
    
    console.error('Error:', errorObj)
    setError(errorObj)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Safe wrapper for async operations
  const safeAsync = useCallback(async (asyncFn, errorMessage = 'An error occurred') => {
    try {
      return await asyncFn()
    } catch (err) {
      const errorObj = {
        message: errorMessage,
        details: {
          error: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString()
        }
      }
      showError(errorObj)
      return null
    }
  }, [showError])

  const value = {
    error,
    showError,
    clearError,
    safeAsync,
  }

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ErrorNotification 
        error={error} 
        onClose={clearError}
        autoClose={true}
        duration={6000}
      />
    </ErrorContext.Provider>
  )
}

