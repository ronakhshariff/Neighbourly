import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth } from '../firebase/config'

const FirebaseAuthContext = createContext()

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext)
  if (!context) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider')
  }
  return context
}

export const FirebaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    try {
      setError(null)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const signup = async (email, password, displayName) => {
    try {
      setError(null)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        })
      }
      
      return userCredential.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const resetPassword = async (email) => {
    try {
      setError(null)
      await sendPasswordResetEmail(auth, email)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    isAuthenticated: !!user
  }

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  )
}

