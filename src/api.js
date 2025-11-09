// api helper - makes calls to the backend
import { API_BASE } from './config';

// get auth token from wherever oidc stored it
// oidc stores it with a weird key format so we gotta search for it
function getToken() {
  try {
    // look through all localStorage keys for the oidc one
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('oidc.user:')) {
        const oidcData = localStorage.getItem(key);
        if (oidcData) {
          const parsed = JSON.parse(oidcData);
          return parsed.id_token || parsed.access_token; // id_token is what we want usually
        }
      }
    }
  } catch (e) {
    console.warn('failed to get token:', e);
  }
  // fallback to old storage format just in case
  return localStorage.getItem('cognito_token') || localStorage.getItem('cognito_id_token');
}

// generic api call function - handles auth headers and errors
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // add auth token if we have one
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // token expired or invalid
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
    console.error('api call failed:', error);
    throw error;
  }
}

// api methods - all the endpoints we use
export const api = {
  healthCheck: () => apiCall('/'),

  // get all requests with optional filters
  getRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/requests?${query}`);
  },

  // get single request
  getRequest: (requestId, city = 'unknown', region = 'unknown') => {
    return apiCall(`/requests/${requestId}?city=${city}&region=${region}`);
  },

  // create new help request
  createRequest: (requestData) => {
    return apiCall('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  },

  // accept a request (volunteer to help)
  acceptRequest: (requestId, city = 'unknown', region = 'unknown') => {
    return apiCall(`/requests/${requestId}/accept?city=${city}&region=${region}`, {
      method: 'POST'
    });
  },

  // update request status (completed, cancelled, etc)
  updateRequestStatus: (requestId, status, city = 'unknown', region = 'unknown') => {
    return apiCall(`/requests/${requestId}/status?city=${city}&region=${region}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // get current logged in user
  getCurrentUser: () => apiCall('/users/me'),
  
  // update user profile
  updateCurrentUser: (userData) => {
    return apiCall('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  // get notifications (pagination)
  getNotifications: (limit = 50, offset = 0) => {
    return apiCall(`/notifications?limit=${limit}&offset=${offset}`);
  },

  // mark notification as read
  markNotificationRead: (notificationId) => {
    return apiCall(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  },

  // count unread notifications
  getUnreadCount: () => apiCall('/notifications/unread-count'),

  // get weather alerts for location
  getWeatherAlerts: (latitude, longitude) => {
    return apiCall(`/weather/alerts?latitude=${latitude}&longitude=${longitude}`);
  },

  // convert address to lat/lng
  geocode: (address) => {
    return apiCall(`/location/geocode?address=${encodeURIComponent(address)}`);
  },

  // convert lat/lng to address
  reverseGeocode: (latitude, longitude) => {
    return apiCall(`/location/reverse-geocode?latitude=${latitude}&longitude=${longitude}`);
  },

  // check city authority verification status
  getCityAuthorityStatus: () => {
    return apiCall('/city/authority/status');
  }
};

