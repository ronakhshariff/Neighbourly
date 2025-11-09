import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContextWrapper'
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
  const cognitoAuth = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Sync user from Cognito auth or create guest user
  useEffect(() => {
    const syncUser = async () => {
      try {
        if (cognitoAuth.isAuthenticated && cognitoAuth.user) {
          // User is authenticated via Cognito
          setUser(cognitoAuth.user)
          
          // Try to get additional user data from backend
          try {
            const currentUser = await api.getCurrentUser()
            setUser({ ...cognitoAuth.user, ...currentUser })
          } catch (error) {
            // Backend might not be available, use Cognito user data
            console.log('Using Cognito user data only:', error)
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
  }, [cognitoAuth.isAuthenticated, cognitoAuth.user, cognitoAuth.loading])

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

  const login = async () => {
    try {
      cognitoAuth.login() // Redirects to Cognito hosted UI
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signup = async (userData) => {
    try {
      // Cognito handles signup through hosted UI
      cognitoAuth.login() // Redirects to Cognito where user can sign up
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      cognitoAuth.logout() // Handles Cognito logout and redirect
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
    loading: loading || cognitoAuth.loading,
    notifications,
    unreadCount,
    login,
    signup,
    logout,
    updateUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshNotifications: loadNotifications,
    isAuthenticated: cognitoAuth.isAuthenticated,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

