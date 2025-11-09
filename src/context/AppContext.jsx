import React, { createContext, useContext, useState, useEffect } from 'react'
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext'
import { requestsAPI, volunteerAPI, cityAPI, notificationAPI } from '../services/api'
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

  // Sync user from Firebase auth or create guest user
  useEffect(() => {
    const syncUser = async () => {
      try {
        if (firebaseAuth.isAuthenticated && firebaseAuth.user) {
          // User is authenticated via Firebase
          const firebaseUser = {
            id: firebaseAuth.user.uid,
            email: firebaseAuth.user.email,
            name: firebaseAuth.user.displayName || firebaseAuth.user.email?.split('@')[0] || 'User',
            role: 'user',
            isGuest: false,
            sub: firebaseAuth.user.uid
          }
          setUser(firebaseUser)
          
          // Try to get additional user data from backend
          try {
            const currentUser = await api.getCurrentUser()
            setUser({ ...firebaseUser, ...currentUser })
          } catch (error) {
            // Backend might not be available, use Firebase user data
            console.log('Using Firebase user data only:', error)
          }
        } else {
          // Create guest user for unauthenticated access
          const guestUser = {
            id: 'guest',
            email: 'guest@burrowly.com',
            name: 'Guest User',
            role: 'user',
            isGuest: true
          }
          setUser(guestUser)
        }
      } catch (error) {
        console.error('Error syncing user:', error)
        // Even on error, create guest user
        setUser({
          id: 'guest',
          email: 'guest@burrowly.com',
          name: 'Guest User',
          role: 'user',
          isGuest: true
        })
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
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await firebaseAuth.logout()
      setUser(null)
      setNotifications([])
      setUnreadCount(0)
      return { success: true }
    } catch (error) {
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

