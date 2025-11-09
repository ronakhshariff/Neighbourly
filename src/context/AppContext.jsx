import React, { createContext, useContext, useState, useEffect } from 'react'
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext'
import { authAPI, requestsAPI, volunteerAPI, cityAPI, notificationAPI } from '../services/api'
import { api } from '../api'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const firebaseAuth = useFirebaseAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Sync user from Firebase auth - only when authenticated
  useEffect(() => {
    const syncUser = async () => {
      try {
        // Wait for Firebase auth to finish loading
        if (firebaseAuth.loading) {
          return
        }

        if (firebaseAuth.isAuthenticated && firebaseAuth.user) {
          // User is authenticated via Firebase
          const firebaseUser = {
            id: firebaseAuth.user.uid,
            email: firebaseAuth.user.email,
            name: firebaseAuth.user.displayName || firebaseAuth.user.email?.split('@')[0] || 'User',
            role: 'user',
            isGuest: false,
            sub: firebaseAuth.user.uid,
            uid: firebaseAuth.user.uid
          }
          setUser(firebaseUser)
          
          // Store user ID in sessionStorage (session-only) for backend access
          const userId = firebaseAuth.user.uid
          sessionStorage.setItem('currentUserId', userId)
          sessionStorage.setItem('firebase_user_id', userId)
          // Also store in localStorage as backup
          localStorage.setItem('currentUserId', userId)
          localStorage.setItem('firebase_user_id', userId)
          
          // Store user email and name for mock backend user creation
          if (firebaseAuth.user.email) {
            sessionStorage.setItem('userEmail', firebaseAuth.user.email)
            localStorage.setItem('userEmail', firebaseAuth.user.email)
          }
          if (firebaseAuth.user.displayName) {
            sessionStorage.setItem('userName', firebaseAuth.user.displayName)
            localStorage.setItem('userName', firebaseAuth.user.displayName)
          }
          
          // Try to get additional user data from backend
          try {
            const currentUser = await api.getCurrentUser()
            if (currentUser && !currentUser.isGuest) {
              const mergedUser = { ...firebaseUser, ...currentUser }
              setUser(mergedUser)
            }
          } catch (error) {
            // Backend might not be available, use Firebase user data
            console.log('Using Firebase user data only:', error)
          }
        } else {
          // Not authenticated - clear all user data
          sessionStorage.removeItem('currentUserId')
          sessionStorage.removeItem('firebase_user_id')
          localStorage.removeItem('currentUserId')
          localStorage.removeItem('firebase_user_id')
          setUser(null)
        }
      } catch (error) {
        console.error('Error syncing user:', error)
        // On error, clear user state
        setUser(null)
        sessionStorage.removeItem('currentUserId')
        sessionStorage.removeItem('firebase_user_id')
        localStorage.removeItem('currentUserId')
        localStorage.removeItem('firebase_user_id')
      } finally {
        setLoading(false)
      }
    }

    syncUser()
  }, [firebaseAuth.isAuthenticated, firebaseAuth.user, firebaseAuth.loading])

  // Load notifications
  useEffect(() => {
    if (user) {
      loadNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      const data = await notificationAPI.getAll()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const login = async (email, password) => {
    try {
      await firebaseAuth.login(email, password)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signup = async (email, password, displayName) => {
    try {
      await firebaseAuth.signup(email, password, displayName)
      // Create user in backend
      try {
        const response = await authAPI.signup({
          email,
          name: displayName,
          displayName,
          role: 'user',
        })
        if (response.user?.id) {
          // Store in sessionStorage (session-only) for security
          sessionStorage.setItem('currentUserId', response.user.id)
          sessionStorage.setItem('firebase_user_id', response.user.id)
          // Also store in localStorage as backup
          localStorage.setItem('currentUserId', response.user.id)
          localStorage.setItem('firebase_user_id', response.user.id)
          
          // Store user email and name for mock backend
          if (email) {
            sessionStorage.setItem('userEmail', email)
            localStorage.setItem('userEmail', email)
          }
          if (displayName) {
            sessionStorage.setItem('userName', displayName)
            localStorage.setItem('userName', displayName)
          }
        }
      } catch (error) {
        console.log('Backend signup failed, using Firebase only:', error)
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      // Clear all auth-related storage (both localStorage and sessionStorage)
      localStorage.removeItem('currentUserId')
      localStorage.removeItem('firebase_user_id')
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('cognito_token')
      localStorage.removeItem('cognito_id_token')
      
      sessionStorage.removeItem('currentUserId')
      sessionStorage.removeItem('firebase_user_id')
      sessionStorage.clear()
      
      // Sign out from Firebase (this will clear Firebase session)
      await firebaseAuth.logout()
      
      // Clear app state
      setUser(null)
      setNotifications([])
      setUnreadCount(0)
      
      return { success: true }
    } catch (error) {
      // Even if logout fails, clear state
      setUser(null)
      setNotifications([])
      setUnreadCount(0)
      localStorage.clear()
      sessionStorage.clear()
      return { success: false, error: error.message }
    }
  }

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem('userData', JSON.stringify(updatedUser))
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const value = {
    user,
    loading: loading || firebaseAuth.loading,
    notifications,
    unreadCount,
    login,
    signup,
    logout,
    updateUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshNotifications: loadNotifications,
    isAuthenticated: firebaseAuth.isAuthenticated,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

