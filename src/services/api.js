// API Service Layer - Handles all backend communication
// Uses Mazen's api.js for real backend, falls back to mockBackend for development

import mockBackend from './mockBackend'
import { api as realApi } from '../api'
import { API_BASE } from '../config'

// Use real backend by default if API_BASE is set, otherwise use mock
const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK === 'true' || (!import.meta.env.VITE_API_BASE && !API_BASE)

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
      localStorage.setItem('currentUserId', response.user.id)
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
      localStorage.setItem('currentUserId', response.user.id)
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
      return mockBackend.getCurrentUser()
    }
    try {
      return await realApi.getCurrentUser()
    } catch (error) {
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
      return mockBackend.createRequest(requestData)
    }
    try {
      return await realApi.createRequest(requestData)
    } catch (error) {
      return mockBackend.createRequest(requestData)
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
      return mockBackend.acceptRequest(id)
    }
    try {
      return await realApi.acceptRequest(id)
    } catch (error) {
      return mockBackend.acceptRequest(id)
    }
  },

  complete: async (id, completionData) => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.completeRequest(id, completionData)
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
      return mockBackend.getMyRequests()
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
      return mockBackend.getVolunteerStats()
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
      return mockBackend.getVolunteerHistory()
    }
    return apiCall('/volunteer/history')
  },

  acceptOpportunity: async (requestId) => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.acceptRequest(requestId)
    }
    return apiCall(`/volunteer/accept/${requestId}`, {
      method: 'POST',
    })
  },

  markComplete: async (helpId, completionData) => {
    if (USE_MOCK_BACKEND) {
      return mockBackend.completeRequest(helpId, completionData)
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
}

// Roadmap APIs
export const roadmapAPI = {
  getBusinesses: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString()
    return apiCall(`/roadmap/businesses?${queryParams}`)
  },

  getTransportation: async () => {
    return apiCall('/roadmap/transportation')
  },

  getPathfinders: async () => {
    return apiCall('/roadmap/pathfinders')
  },

  getDeals: async () => {
    return apiCall('/roadmap/deals')
  },

  getSupportServices: async () => {
    return apiCall('/roadmap/support-services')
  },

  submitBusinessInfo: async (businessData) => {
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

