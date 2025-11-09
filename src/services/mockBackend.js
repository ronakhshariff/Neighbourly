// Mock Backend Service - Simulates real backend behavior
// This provides full functionality until real backend is connected

import { helpRequests, myRequests, cityRequests } from '../data/mockData'

class MockBackend {
  constructor() {
    this.users = this.loadFromStorage('users', [
      {
        id: 'user_1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        location: 'Downtown',
        coordinates: { lat: 51.0447, lng: -114.0719 },
        skills: ['Shopping', 'Physical labor'],
        joinedDate: new Date('2024-01-15'),
        avatar: null,
      },
    ])
    
    // Initialize requests from mockData if storage is empty
    const storedRequests = this.loadFromStorage('requests', null)
    if (!storedRequests || storedRequests.length === 0) {
      this.requests = helpRequests.map(r => ({
        ...r,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
      this.saveToStorage('requests', this.requests)
    } else {
      this.requests = storedRequests
    }
    
    this.conversations = this.loadFromStorage('conversations', [])
    this.notifications = this.loadFromStorage('notifications', [])
    this.volunteerStats = this.loadFromStorage('volunteerStats', {
      totalHelps: 47,
      hoursVolunteered: 128,
      currentActive: 3,
      rating: 4.9,
      streak: 12,
    })
    this.achievements = this.loadFromStorage('achievements', [])
  }

  loadFromStorage(key, defaultValue) {
    try {
      const stored = localStorage.getItem(`mock_${key}`)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  }

  saveToStorage(key, data) {
    try {
      localStorage.setItem(`mock_${key}`, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving ${key}:`, error)
    }
  }

  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Auth methods
  async login(email, password) {
    await this.delay(500)
    const user = this.users.find(u => u.email === email)
    if (!user) {
      throw new Error('Invalid email or password')
    }
    return {
      user,
      token: `mock_token_${user.id}_${Date.now()}`,
    }
  }

  async signup(userData) {
    await this.delay(500)
    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      role: userData.role || 'user',
      joinedDate: new Date(),
      avatar: null,
      skills: [],
    }
    this.users.push(newUser)
    this.saveToStorage('users', this.users)
    return {
      user: newUser,
      token: `mock_token_${newUser.id}_${Date.now()}`,
    }
  }

  async getCurrentUser() {
    await this.delay(200)
    // In real app, this would decode the token
    const userId = localStorage.getItem('currentUserId') || 'user_1'
    return this.users.find(u => u.id === userId) || this.users[0]
  }

  // Requests methods
  async getAllRequests(filters = {}) {
    await this.delay(400)
    let filtered = [...this.requests]
    
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(r => r.category === filters.category)
    }
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(r => r.priority === filters.priority)
    }
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower)
      )
    }
    
    return { requests: filtered }
  }

  async getRequestById(id) {
    await this.delay(200)
    const request = this.requests.find(r => r.id === parseInt(id))
    if (!request) {
      throw new Error('Request not found')
    }
    return request
  }

  async createRequest(requestData) {
    await this.delay(500)
    const newRequest = {
      id: Date.now(),
      ...requestData,
      status: 'Active',
      volunteerCount: 0,
      timestamp: new Date(),
      time: 'Just now',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.requests.unshift(newRequest)
    this.saveToStorage('requests', this.requests)
    
    // Create notification for nearby volunteers
    this.createNotification({
      type: 'new_request',
      title: 'New help request nearby',
      message: `${newRequest.title} - ${newRequest.distance} away`,
      requestId: newRequest.id,
    })
    
    return newRequest
  }

  async updateRequest(id, updates) {
    await this.delay(300)
    const index = this.requests.findIndex(r => r.id === parseInt(id))
    if (index === -1) {
      throw new Error('Request not found')
    }
    this.requests[index] = {
      ...this.requests[index],
      ...updates,
      updatedAt: new Date(),
    }
    this.saveToStorage('requests', this.requests)
    return this.requests[index]
  }

  async acceptRequest(id) {
    await this.delay(400)
    const request = await this.getRequestById(id)
    if (request.status !== 'Active') {
      throw new Error('Request is no longer active')
    }
    
    const updated = await this.updateRequest(id, {
      status: 'Assigned',
      volunteerCount: request.volunteerCount + 1,
      assignedVolunteer: 'Current User',
      assignedAt: new Date(),
    })
    
    // Create notification for requester
    this.createNotification({
      type: 'request_accepted',
      title: 'Your request was accepted!',
      message: `${updated.assignedVolunteer} has accepted your request: ${updated.title}`,
      requestId: id,
    })
    
    return updated
  }

  async completeRequest(id, completionData) {
    await this.delay(400)
    const request = await this.getRequestById(id)
    
    const updated = await this.updateRequest(id, {
      status: 'Completed',
      completedAt: new Date(),
      ...completionData,
    })
    
    // Update volunteer stats
    this.volunteerStats.totalHelps += 1
    this.volunteerStats.hoursVolunteered += (completionData.hoursSpent || 1)
    this.saveToStorage('volunteerStats', this.volunteerStats)
    
    // Create notification
    this.createNotification({
      type: 'request_completed',
      title: 'Request completed',
      message: `Your help request "${updated.title}" has been completed`,
      requestId: id,
    })
    
    return updated
  }

  async deleteRequest(id) {
    await this.delay(300)
    const index = this.requests.findIndex(r => r.id === parseInt(id))
    if (index === -1) {
      throw new Error('Request not found')
    }
    this.requests.splice(index, 1)
    this.saveToStorage('requests', this.requests)
    return { success: true }
  }

  async getMyRequests() {
    await this.delay(300)
    const userId = localStorage.getItem('currentUserId') || 'user_1'
    return {
      requests: this.requests.filter(r => r.requesterId === userId),
    }
  }

  async getAcceptedRequests() {
    await this.delay(300)
    return {
      requests: this.requests.filter(r => 
        r.status === 'Assigned' || r.status === 'In Progress'
      ),
    }
  }

  // Volunteer methods
  async getOpportunities(filters = {}) {
    await this.delay(400)
    const allRequests = await this.getAllRequests(filters)
    return {
      opportunities: allRequests.requests
        .filter(r => r.status === 'Active')
        .map(r => ({
          id: r.id,
          title: r.title,
          requester: r.requester,
          distance: r.distance,
          urgency: r.urgency,
          category: r.category,
          timeNeeded: r.timeNeeded,
          posted: r.time,
          description: r.description,
          skills: r.skills || [],
          reward: `${r.category} Helper Badge`,
          volunteersNeeded: r.volunteersNeeded,
          currentVolunteers: r.volunteerCount,
        })),
    }
  }

  async getMyHelps() {
    await this.delay(300)
    return {
      helps: this.requests
        .filter(r => r.assignedVolunteer === 'Current User')
        .map(r => ({
          id: r.id,
          title: r.title,
          requester: r.requester,
          status: r.status === 'Assigned' ? 'Scheduled' : r.status,
          accepted: r.assignedAt ? this.formatTimeAgo(r.assignedAt) : 'Recently',
          scheduledTime: r.scheduledTime,
          estimatedCompletion: '30 min',
          contact: 'In-app chat',
          completed: r.completedAt ? this.formatTimeAgo(r.completedAt) : null,
          rating: r.rating,
          feedback: r.feedback,
        })),
    }
  }

  async getVolunteerStats() {
    await this.delay(200)
    return this.volunteerStats
  }

  async getAchievements() {
    await this.delay(300)
    return {
      achievements: [
        { id: 1, name: 'First Help', icon: '🌟', earned: true, date: 'Jan 15, 2024' },
        { id: 2, name: '10 Helps', icon: '⭐', earned: true, date: 'Feb 20, 2024' },
        { id: 3, name: '50 Helps', icon: '🏆', earned: true, date: 'Dec 10, 2024' },
        { id: 4, name: '100 Helps', icon: '💎', earned: false, progress: this.volunteerStats.totalHelps },
        { id: 5, name: 'Week Streak', icon: '🔥', earned: true, date: 'Current' },
        { id: 6, name: 'Month Streak', icon: '⚡', earned: false, progress: this.volunteerStats.streak },
        { id: 7, name: 'Elderly Care Specialist', icon: '👴', earned: true, date: 'Nov 5, 2024' },
        { id: 8, name: 'Accessibility Champion', icon: '♿', earned: true, date: 'Oct 18, 2024' },
      ],
    }
  }

  async getVolunteerHistory() {
    await this.delay(300)
    return {
      history: this.requests
        .filter(r => r.status === 'Completed' && r.assignedVolunteer === 'Current User')
        .map(r => ({
          id: r.id,
          title: r.title,
          date: this.formatTimeAgo(r.completedAt || r.updatedAt),
          hours: 1.5,
          rating: r.rating || 5,
        })),
    }
  }

  // City Dashboard methods
  async getDashboardStats(timeframe = '7d') {
    await this.delay(400)
    const activeRequests = this.requests.filter(r => r.status === 'Active').length
    const completedToday = this.requests.filter(r => {
      if (r.status !== 'Completed') return false
      const completed = new Date(r.completedAt || r.updatedAt)
      const today = new Date()
      return completed.toDateString() === today.toDateString()
    }).length
    
    return {
      totalRequests: this.requests.length,
      activeRequests,
      completedToday,
      avgResponseTime: '4.2 min',
      verifiedWorkers: 156,
      pendingVerifications: 3,
    }
  }

  async getRecentRequests(limit = 10) {
    await this.delay(300)
    return {
      requests: this.requests
        .slice(0, limit)
        .map(r => ({
          id: r.id,
          type: r.category,
          location: r.location,
          priority: r.priority,
          time: r.time,
          status: r.status,
        })),
    }
  }

  async getPendingVerifications() {
    await this.delay(300)
    return {
      verifications: [
        { id: 1, name: 'Sarah Johnson', role: 'City Worker', submitted: '2 hours ago', documents: 3 },
        { id: 2, name: 'Michael Chen', role: 'Emergency Responder', submitted: '5 hours ago', documents: 2 },
        { id: 3, name: 'Emily Rodriguez', role: 'City Planner', submitted: '1 day ago', documents: 4 },
      ],
    }
  }

  async verifyWorker(workerId, decision) {
    await this.delay(400)
    // In real app, this would update the worker's verification status
    return { success: true, decision }
  }

  // Notification methods
  async getNotifications() {
    await this.delay(200)
    const unreadCount = this.notifications.filter(n => !n.read).length
    return {
      notifications: this.notifications,
      unreadCount,
    }
  }

  async markNotificationAsRead(id) {
    await this.delay(200)
    const notification = this.notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
      this.saveToStorage('notifications', this.notifications)
    }
    return { success: true }
  }

  async markAllNotificationsAsRead() {
    await this.delay(200)
    this.notifications.forEach(n => n.read = true)
    this.saveToStorage('notifications', this.notifications)
    return { success: true }
  }

  createNotification(notification) {
    const newNotification = {
      id: Date.now(),
      ...notification,
      read: false,
      createdAt: new Date(),
    }
    this.notifications.unshift(newNotification)
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }
    this.saveToStorage('notifications', this.notifications)
  }

  // Helper methods
  formatTimeAgo(date) {
    if (!date) return 'Unknown'
    const now = new Date()
    const past = new Date(date)
    const diffMs = now - past
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return past.toLocaleDateString()
  }
}

// Export singleton instance
export default new MockBackend()

