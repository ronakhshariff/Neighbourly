// API Service Layer - Handles all backend communication
// Uses Mazen's api.js for real backend, falls back to mockBackend for development

import mockBackend from './mockBackend'
import { api as realApi } from '../api'
import { API_BASE } from '../config'

// Use mock backend by default in development
// Set VITE_USE_MOCK=false to use real API (requires VITE_API_BASE to be set)
// Set VITE_USE_MOCK=true to force mock backend
const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK !== 'false'

// Helper function to get OIDC token (from Mazen's api.js)
function getToken() {
  try {
    // look through all localStorage keys for the oidc one
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('oidc.user:')) {
        const oidcData = localStorage.getItem(key);
        if (oidcData) {
          const parsed = JSON.parse(oidcData);
          return parsed.id_token || parsed.access_token;
        }
      }
    }
  } catch (e) {
    console.warn('failed to get token:', e);
  }
  // fallback to old storage format just in case
  return localStorage.getItem('cognito_token') || localStorage.getItem('cognito_id_token') || localStorage.getItem('authToken');
}

// Helper function for API calls (uses real API when available)
async function apiCall(endpoint, options = {}) {
  if (!USE_MOCK_BACKEND && API_BASE) {
    // Use real backend API
    try {
      // Use Mazen's api.js methods when available, otherwise use fetch with token
      const token = getToken();
      const url = `${API_BASE}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      if (response.status === 401) {
        localStorage.removeItem('cognito_token');
        throw new Error('unauthorized - log in again');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `api error: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API call failed, falling back to mock:', error);
      // Fall through to mock backend
    }
  }
  
  // Use mock backend
  throw new Error('Using mock backend - implement endpoint in mockBackend');
}

// Authentication APIs
export const authAPI = {
  login: async (email, password) => {
    if (USE_MOCK_BACKEND) {
      const response = await mockBackend.login(email, password)
      // Store in sessionStorage (session-only) for security
      sessionStorage.setItem('currentUserId', response.user.id)
      sessionStorage.setItem('firebase_user_id', response.user.id)
      // Also store in localStorage as backup
      localStorage.setItem('currentUserId', response.user.id)
      localStorage.setItem('firebase_user_id', response.user.id)
      return response
    }
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  signup: async (userData) => {
    if (USE_MOCK_BACKEND) {
      const response = await mockBackend.signup(userData)
      // Store in sessionStorage (session-only) for security
      sessionStorage.setItem('currentUserId', response.user.id)
      sessionStorage.setItem('firebase_user_id', response.user.id)
      // Also store in localStorage as backup
      localStorage.setItem('currentUserId', response.user.id)
      localStorage.setItem('firebase_user_id', response.user.id)
      return response
    }
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  logout: async () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('currentUserId')
    return Promise.resolve()
  },

  getCurrentUser: async () => {
    if (USE_MOCK_BACKEND) {
      // Check sessionStorage first (session-only), then localStorage as fallback
      const userId = sessionStorage.getItem('currentUserId') || 
                     sessionStorage.getItem('firebase_user_id') ||
                     localStorage.getItem('currentUserId') || 
                     localStorage.getItem('firebase_user_id')
      if (userId && userId !== 'guest') {
        return mockBackend.getCurrentUser(userId)
      }
      return mockBackend.getCurrentUser()
    }
    try {
      return await realApi.getCurrentUser()
    } catch (error) {
      const userId = sessionStorage.getItem('currentUserId') || 
                     sessionStorage.getItem('firebase_user_id') ||
                     localStorage.getItem('currentUserId') || 
                     localStorage.getItem('firebase_user_id')
      if (userId && userId !== 'guest') {
        return mockBackend.getCurrentUser(userId)
      }
      return mockBackend.getCurrentUser()
    }
  },

  updateProfile: async (profileData) => {
    if (USE_MOCK_BACKEND) {
      // Update user in mock backend
      const user = await mockBackend.getCurrentUser()
      const updated = { ...user, ...profileData }
      mockBackend.users = mockBackend.users.map(u => u.id === user.id ? updated : u)
      mockBackend.saveToStorage('users', mockBackend.users)
      return updated
    }
    return apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },
}

// Help Requests APIs
export const requestsAPI = {
  getAll: async (filters = {}) => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.getAllRequests(filters)
    }
    try {
      // Use Mazen's api.js
      return await realApi.getRequests(filters)
    } catch (error) {
      // Fallback to mock if real API fails
      return mockBackend.getAllRequests(filters)
    }
  },

  getById: async (id) => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.getRequestById(id)
    }
    try {
      return await realApi.getRequest(id)
    } catch (error) {
      return mockBackend.getRequestById(id)
    }
  },

  create: async (requestData) => {
    if (USE_MOCK_BACKEND) {
      const userId = sessionStorage.getItem('currentUserId') || sessionStorage.getItem('firebase_user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('firebase_user_id')
      if (!userId) {
        throw new Error('User must be logged in to create requests')
      }
      return mockBackend.createRequest(userId, requestData)
    }
    try {
      return await realApi.createRequest(requestData)
    } catch (error) {
      const userId = sessionStorage.getItem('currentUserId') || sessionStorage.getItem('firebase_user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('firebase_user_id')
      if (!userId) {
        throw new Error('User must be logged in to create requests')
      }
      return mockBackend.createRequest(userId, requestData)
    }
  },

  update: async (id, updates) => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.updateRequest(id, updates)
    }
    return apiCall(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  delete: async (id) => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.deleteRequest(id)
    }
    return apiCall(`/requests/${id}`, {
      method: 'DELETE',
    })
  },

  accept: async (id) => {
    if (USE_MOCK_BACKEND) {
      const userId = sessionStorage.getItem('currentUserId') || sessionStorage.getItem('firebase_user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('firebase_user_id')
      if (!userId) {
        throw new Error('User must be logged in to accept requests')
      }
      return mockBackend.acceptRequest(id, userId)
    }
    try {
      return await realApi.acceptRequest(id)
    } catch (error) {
      const userId = sessionStorage.getItem('currentUserId') || sessionStorage.getItem('firebase_user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('firebase_user_id')
      if (!userId) {
        throw new Error('User must be logged in to accept requests')
      }
      return mockBackend.acceptRequest(id, userId)
    }
  },

  complete: async (id, completionData) => {
    if (USE_MOCK_BACKEND) {
      const userId = sessionStorage.getItem('currentUserId') || sessionStorage.getItem('firebase_user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('firebase_user_id')
      if (!userId) {
        throw new Error('User must be logged in to complete requests')
      }
      return mockBackend.completeRequest(id, userId, completionData?.rating, completionData?.feedback)
    }
    return apiCall(`/requests/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(completionData),
    })
  },

  cancel: async (id) => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.updateRequest(id, { status: 'Cancelled' })
    }
    return apiCall(`/requests/${id}/cancel`, {
      method: 'POST',
    })
  },

  getMyRequests: async () => {
    if (USE_MOCK_BACKEND) {
      const userId = sessionStorage.getItem('currentUserId') || sessionStorage.getItem('firebase_user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('firebase_user_id')
      if (!userId) {
        return { requests: [] }
      }
      return mockBackend.getMyRequests(userId)
    }
    return apiCall('/requests/my')
  },

  getAcceptedRequests: async () => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.getAcceptedRequests()
    }
    return apiCall('/requests/accepted')
  },
}

// Volunteer APIs
export const volunteerAPI = {
  getOpportunities: async (filters = {}) => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.getOpportunities(filters)
    }
    const queryParams = new URLSearchParams(filters).toString()
    return apiCall(`/volunteer/opportunities?${queryParams}`)
  },

  getMyHelps: async () => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.getMyHelps()
    }
    return apiCall('/volunteer/my-helps')
  },

  getStats: async () => {
    if (USE_MOCK_BACKEND) {
      const userId = sessionStorage.getItem('currentUserId') || sessionStorage.getItem('firebase_user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('firebase_user_id')
      if (!userId) {
        return {
          totalHelps: 0,
          hoursVolunteered: 0,
          currentActive: 0,
          rating: null,
          streak: 0,
        }
      }
      return mockBackend.getVolunteerStats(userId)
    }
    return apiCall('/volunteer/stats')
  },

  getAchievements: async () => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.getAchievements()
    }
    return apiCall('/volunteer/achievements')
  },

  getHistory: async () => {
    if (USE_MOCK_BACKEND) {
      const userId = sessionStorage.getItem('currentUserId') || sessionStorage.getItem('firebase_user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('firebase_user_id')
      if (!userId) {
        return []
      }
      return mockBackend.getVolunteerHistory(userId)
    }
    return apiCall('/volunteer/history')
  },

  acceptOpportunity: async (requestId) => {
    if (USE_MOCK_BACKEND) {
      const userId = sessionStorage.getItem('currentUserId') || sessionStorage.getItem('firebase_user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('firebase_user_id')
      if (!userId) {
        throw new Error('User must be logged in to accept opportunities')
      }
      return mockBackend.acceptRequest(requestId, userId)
    }
    return apiCall(`/volunteer/accept/${requestId}`, {
      method: 'POST',
    })
  },

  markComplete: async (helpId, completionData) => {
    if (USE_MOCK_BACKEND) {
      const userId = sessionStorage.getItem('currentUserId') || sessionStorage.getItem('firebase_user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('firebase_user_id')
      if (!userId) {
        throw new Error('User must be logged in to mark requests as complete')
      }
      return mockBackend.completeRequest(helpId, userId, completionData?.rating, completionData?.feedback)
    }
    return apiCall(`/volunteer/complete/${helpId}`, {
      method: 'POST',
      body: JSON.stringify(completionData),
    })
  },
}

// City Dashboard APIs
export const cityAPI = {
  getDashboardStats: async (timeframe = '7d') => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.getDashboardStats(timeframe)
    }
    return apiCall(`/city/dashboard?timeframe=${timeframe}`)
  },

  getRecentRequests: async (limit = 10) => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.getRecentRequests(limit)
    }
    return apiCall(`/city/requests?limit=${limit}`)
  },

  getPendingVerifications: async () => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.getPendingVerifications()
    }
    return apiCall('/city/verifications/pending')
  },

  verifyWorker: async (workerId, decision) => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.verifyWorker(workerId, decision)
    }
    return apiCall(`/city/verifications/${workerId}`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    })
  },

  getAnalytics: async (timeframe = '7d') => {
    if (USE_MOCK_BACKEND) {
      // Return mock analytics
      return {
        requestsByCategory: {},
        requestsByPriority: {},
        responseTimeTrend: [],
      }
    }
    return apiCall(`/city/analytics?timeframe=${timeframe}`)
  },

  getHeatmapData: async () => {
    if (USE_MOCK_BACKEND) {
      // Return mock heatmap data
      return {
        points: [],
      }
    }
    return apiCall('/city/heatmap')
  },

  // City Authority Verification
  checkCityAuthorityStatus: async () => {
    if (USE_MOCK_BACKEND) {
      // Check localStorage for verification status
      const status = localStorage.getItem('cityAuthorityVerified')
      return {
        verified: status === 'true',
        status: status === 'true' ? 'approved' : status || 'pending',
        message: status === 'true' ? 'You are verified as a city authority' : 'Verification pending'
      }
    }
    try {
      return await realApi.getCityAuthorityStatus()
    } catch (error) {
      return { verified: false, status: 'pending', message: 'Verification required' }
    }
  },

  requestCityAuthorityVerification: async (formData) => {
    if (USE_MOCK_BACKEND) {
      // Store in localStorage for demo
      const formDataObj = {}
      for (let [key, value] of formData.entries()) {
        formDataObj[key] = value
      }
      localStorage.setItem('cityAuthorityVerificationRequest', JSON.stringify({
        ...formDataObj,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      }))
      // For demo, auto-approve after 2 seconds
      setTimeout(() => {
        localStorage.setItem('cityAuthorityVerified', 'true')
      }, 2000)
      return { success: true, message: 'Verification request submitted' }
    }
    try {
      // For real API, send FormData
      const token = getToken()
      const response = await fetch(`${API_BASE}/city/authority/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit verification')
      }
      return data
    } catch (error) {
      throw error
    }
  },
}

// Roadmap APIs
export const roadmapAPI = {
  getBusinesses: async (filters = {}) => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.getBusinesses(filters)
    }
    const queryParams = new URLSearchParams(filters).toString()
    return apiCall(`/roadmap/businesses?${queryParams}`)
  },

  getTransportation: async () => {
    if (USE_MOCK_BACKEND) {
      // Return mock transportation data
      return [
        {
          id: 'trans_1',
          name: 'Calgary Transit Access',
          type: 'Paratransit',
          description: 'Door-to-door accessible transit service',
          phone: '+1-403-262-1000',
          eligibility: 'Access2 card holders',
        }
      ]
    }
    return apiCall('/roadmap/transportation')
  },

  getPathfinders: async () => {
    if (USE_MOCK_BACKEND) {
      // Return mock pathfinder data
      return []
    }
    return apiCall('/roadmap/pathfinders')
  },

  getDeals: async () => {
    if (USE_MOCK_BACKEND) {
      // Return mock deals data
      return []
    }
    return apiCall('/roadmap/deals')
  },

  getSupportServices: async () => {
    if (USE_MOCK_BACKEND) {
      // Return special needs locations as support services
      return mockBackend.getLocations({ type: 'special-needs-location' })
    }
    return apiCall('/roadmap/support-services')
  },

  submitBusinessInfo: async (businessData) => {
    if (USE_MOCK_BACKEND) {
      const userId = sessionStorage.getItem('currentUserId') || sessionStorage.getItem('firebase_user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('firebase_user_id')
      if (!userId) {
        throw new Error('User must be logged in to submit business info')
      }
      return mockBackend.createBusiness(userId, businessData)
    }
    return apiCall('/roadmap/businesses', {
      method: 'POST',
      body: JSON.stringify(businessData),
    })
  },
}

// Chat/Messaging APIs
export const chatAPI = {
  getConversations: async () => {
    return apiCall('/chat/conversations')
  },

  getMessages: async (conversationId) => {
    return apiCall(`/chat/conversations/${conversationId}/messages`)
  },

  sendMessage: async (conversationId, message) => {
    return apiCall(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  },

  createConversation: async (requestId) => {
    return apiCall('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ requestId }),
    })
  },
}

// Notification APIs
export const notificationAPI = {
  getAll: async () => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.getNotifications()
    }
    try {
      const data = await realApi.getNotifications(50, 0)
      return {
        notifications: data.notifications || data || [],
        unreadCount: data.unreadCount || 0
      }
    } catch (error) {
      return mockBackend.getNotifications()
    }
  },

  markAsRead: async (notificationId) => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.markNotificationAsRead(notificationId)
    }
    try {
      return await realApi.markNotificationRead(notificationId)
    } catch (error) {
      return mockBackend.markNotificationAsRead(notificationId)
    }
  },

  markAllAsRead: async () => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.markAllNotificationsAsRead()
    }
    try {
      // Mark all as read by marking each one
      const notifications = await notificationAPI.getAll()
      await Promise.all(
        (notifications.notifications || [])
          .filter(n => !n.read)
          .map(n => realApi.markNotificationRead(n.id))
      )
      return { success: true }
    } catch (error) {
      return mockBackend.markAllNotificationsAsRead()
    }
  },
}

// For development: Mock API that simulates backend
// Remove this when connecting to real backend
export const mockAPI = {
  // Simulate API delay
  delay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock data storage (in real app, this would be in database)
  storage: {
    users: JSON.parse(localStorage.getItem('mockUsers') || '[]'),
    requests: JSON.parse(localStorage.getItem('mockRequests') || '[]'),
    conversations: JSON.parse(localStorage.getItem('mockConversations') || '[]'),
  },

  save: () => {
    localStorage.setItem('mockUsers', JSON.stringify(mockAPI.storage.users))
    localStorage.setItem('mockRequests', JSON.stringify(mockAPI.storage.requests))
    localStorage.setItem('mockConversations', JSON.stringify(mockAPI.storage.conversations))
  },
}

export default {
  auth: authAPI,
  requests: requestsAPI,
  volunteer: volunteerAPI,
  city: cityAPI,
  roadmap: roadmapAPI,
  chat: chatAPI,
  notifications: notificationAPI,
}

