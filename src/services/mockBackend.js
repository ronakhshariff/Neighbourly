// Complete Mock Backend Service - Comprehensive Database System
// All entities linked to users with real-time updates
// Matches DynamoDB schema: PK (city#region), SK (request#id or user#id)

import { 
  users, 
  requests, 
  businesses, 
  locations, 
  volunteerActivities, 
  achievements, 
  conversations, 
  messages, 
  notifications, 
  cityAuthorities 
} from '../data/mockData'

class CompleteMockBackend {
  constructor() {
    // Initialize all database tables/collections
    this.initializeDatabase()
  }

  initializeDatabase() {
    // ========== USERS TABLE ==========
    // Load from mockData.js - matches UserItem schema
    this.users = this.loadFromStorage('users', users)

    // ========== REQUESTS TABLE ==========
    // Load from mockData.js - matches RequestItem schema
    const storedRequests = this.loadFromStorage('requests', null)
    if (!storedRequests || storedRequests.length === 0) {
      this.requests = requests.map(r => ({
        ...r,
        // Ensure all required fields are present
        id: r.id || r.requestId,
        requestId: r.requestId || r.id,
        status: r.status || 'open',
        urgency: r.urgency || 'medium',
        location: r.location || {
          latitude: r.latitude || r.coordinates?.lat || 51.0447,
          longitude: r.longitude || r.coordinates?.lng || -114.0719,
          address: r.address || '',
          areaName: r.location?.areaName || r.location || 'Calgary'
        },
        images: r.images || [],
        acceptedBy: r.acceptedBy || r.volunteerId || null,
        aiLabels: r.aiLabels || [],
        translatedDescription: r.translatedDescription || {},
      }))
      this.saveToStorage('requests', this.requests)
    } else {
      this.requests = storedRequests
    }

    // ========== BUSINESSES TABLE ==========
    // Load from mockData.js
    this.businesses = this.loadFromStorage('businesses', businesses)

    // ========== LOCATIONS TABLE ==========
    // Load from mockData.js
    this.locations = this.loadFromStorage('locations', locations)

    // ========== VOLUNTEER ACTIVITIES TABLE ==========
    // Load from mockData.js - linked to users and requests
    this.volunteerActivities = this.loadFromStorage('volunteerActivities', volunteerActivities)

    // ========== ACHIEVEMENTS TABLE ==========
    // Load from mockData.js - linked to users
    this.achievements = this.loadFromStorage('achievements', achievements)

    // ========== CONVERSATIONS TABLE ==========
    // Load from mockData.js - linked to users and requests
    this.conversations = this.loadFromStorage('conversations', conversations)

    // ========== MESSAGES TABLE ==========
    // Load from mockData.js - linked to conversations and users
    this.messages = this.loadFromStorage('messages', messages)

    // ========== NOTIFICATIONS TABLE ==========
    // Load from mockData.js - linked to users
    this.notifications = this.loadFromStorage('notifications', notifications)

    // ========== CITY AUTHORITY TABLE ==========
    // Load from mockData.js - linked to users
    this.cityAuthorities = this.loadFromStorage('cityAuthorities', cityAuthorities)

    // ========== ROADMAP DATA TABLE ==========
    // Roadmap information (businesses, transportation, etc.)
    this.roadmapData = this.loadFromStorage('roadmapData', [
      {
        id: 'roadmap_1',
        roadmapId: 'roadmap_1',
        businessId: 'biz_1',
        businessName: 'Sobeys',
        type: 'business-access',
        accessInfo: {
          sensoryFriendlyHours: 'Mon-Sun: 9am-10am',
          accommodations: ['Wheelchair accessible', 'ASL trained staff'],
          policies: 'Access2 card holders get priority assistance',
          visualCues: ['Ramp at main entrance', 'Wide aisles throughout'],
          languages: ['en', 'fr'],
          onlineAdaptations: 'Email support@sobeys-calgary.com for special accommodations',
        },
        createdBy: 'user_1',
        verified: true,
        verifiedBy: 'user_1',
        verifiedAt: new Date('2024-01-10').toISOString(),
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])

    // Save all initial data
    this.saveAllToStorage()
  }

  // Helper methods
  getUserById(userId) {
    if (!userId || userId === 'guest') {
      return null
    }
    
    let user = this.users.find(u => u.id === userId || u.userId === userId)
    
    // If user not found, try to create a basic user entry from Firebase auth
    // This happens when a Firebase user logs in but doesn't exist in mock backend yet
    if (!user) {
      // Try to get user info from localStorage/sessionStorage (stored during Firebase login)
      const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail')
      const userName = sessionStorage.getItem('userName') || localStorage.getItem('userName') || 'User'
      
      // Also try to get from Firebase auth if available (for immediate use)
      // Check if we can get it from the current context
      let firebaseEmail = userEmail
      let firebaseName = userName
      
      // Create a basic user entry
      user = {
        id: userId,
        userId: userId,
        PK: 'calgary#alberta',
        SK: `user#${userId}`,
        email: firebaseEmail || `${userId}@firebase.user`,
        name: firebaseName,
        displayName: firebaseName,
        role: 'user',
        phone: null,
        city: 'Calgary',
        region: 'Alberta',
        location: 'Calgary',
        address: null,
        postalCode: null,
        coordinates: { lat: 51.0447, lng: -114.0719 },
        latitude: 51.0447,
        longitude: -114.0719,
        skillsOffered: [],
        assistanceNeeded: [],
        bio: null,
        preferredLanguage: 'en',
        avatar: null,
        rating: null,
        totalHelps: 0,
        hoursVolunteered: 0,
        currentActiveHelps: 0,
        streak: 0,
        isVerified: false,
        verificationStatus: 'pending',
        accessLevel: 'user',
        notificationsEnabled: true,
        joinedDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // Add to users array and save
      this.users.push(user)
      this.saveToStorage('users', this.users)
      console.log('Created user in mock backend:', userId, firebaseName || firebaseEmail)
    }
    
    return user
  }

  getUserIdByName(name) {
    const user = this.users.find(u => u.name === name || u.displayName === name)
    return user?.id
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

  saveAllToStorage() {
    this.saveToStorage('users', this.users)
    this.saveToStorage('requests', this.requests)
    this.saveToStorage('businesses', this.businesses)
    this.saveToStorage('locations', this.locations)
    this.saveToStorage('volunteerActivities', this.volunteerActivities)
    this.saveToStorage('achievements', this.achievements)
    this.saveToStorage('conversations', this.conversations)
    this.saveToStorage('messages', this.messages)
    this.saveToStorage('notifications', this.notifications)
    this.saveToStorage('cityAuthorities', this.cityAuthorities)
    this.saveToStorage('roadmapData', this.roadmapData)
  }

  // Real-time update system
  notifyUpdate(type, data) {
    // Trigger real-time updates
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('databaseUpdate', {
        detail: { type, data, timestamp: new Date().toISOString() }
      }))
    }
  }

  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ========== AUTH METHODS ==========
  async login(email, password) {
    await this.delay(500)
    const user = this.users.find(u => u.email === email)
    if (!user) {
      throw new Error('Invalid email or password')
    }
    
    // Update last active
    user.lastActive = new Date().toISOString()
    this.saveToStorage('users', this.users)
    
    return {
      user: { ...user, sub: user.id, uid: user.id },
      token: `mock_token_${user.id}_${Date.now()}`,
    }
  }

  async signup(userData) {
    await this.delay(500)
    const newUser = {
      id: `user_${Date.now()}`,
      userId: `user_${Date.now()}`,
      email: userData.email,
      name: userData.name || userData.displayName,
      displayName: userData.displayName || userData.name,
      role: userData.role || 'user',
      phone: userData.phone || null,
      location: userData.location || 'Calgary',
      address: userData.address || null,
      coordinates: userData.coordinates || { lat: 51.0447, lng: -114.0719 },
      city: userData.city || 'Calgary',
      region: userData.region || 'Alberta',
      postalCode: userData.postalCode || null,
      skills: userData.skills || [],
      skillsOffered: userData.skillsOffered || userData.skills || [],
      assistanceNeeded: userData.assistanceNeeded || [],
      bio: userData.bio || null,
      preferredLanguage: userData.preferredLanguage || 'en',
      avatar: userData.avatar || null,
      rating: null,
      totalHelps: 0,
      hoursVolunteered: 0,
      currentActiveHelps: 0,
      streak: 0,
      joinedDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isVerified: false,
      verificationStatus: 'pending',
      accessLevel: 'user',
      notificationsEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    this.users.push(newUser)
    this.saveToStorage('users', this.users)
    this.notifyUpdate('user_created', newUser)
    
    return {
      user: { ...newUser, sub: newUser.id, uid: newUser.id },
      token: `mock_token_${newUser.id}_${Date.now()}`,
    }
  }

  async getCurrentUser(userId) {
    try {
      await this.delay(200)
      if (!userId || userId === 'guest') {
        return {
          id: 'guest',
          userId: 'guest',
          email: null,
          name: 'Guest',
          displayName: 'Guest',
          role: 'guest',
          isGuest: true,
          sub: 'guest',
          uid: 'guest',
        }
      }
      // getUserById will automatically create the user if they don't exist
      const user = this.getUserById(userId)
      if (!user) {
        // Return guest user instead of throwing
        return {
          id: 'guest',
          userId: 'guest',
          email: null,
          name: 'Guest',
          displayName: 'Guest',
          role: 'guest',
          isGuest: true,
          sub: 'guest',
          uid: 'guest',
        }
      }
      return { ...user, sub: user.id, uid: user.id }
    } catch (error) {
      console.error('Error getting current user:', error)
      // Return guest user on error to prevent app crash
      return {
        id: 'guest',
        userId: 'guest',
        email: null,
        name: 'Guest',
        displayName: 'Guest',
        role: 'guest',
        isGuest: true,
        sub: 'guest',
        uid: 'guest',
      }
    }
  }

  // ========== REQUESTS METHODS ==========
  async getAllRequests(filters = {}) {
    await this.delay(300)
    let filtered = [...this.requests]
    
    // Map frontend status to database status
    const statusMap = {
      'Active': 'open',
      'Assigned': 'accepted',
      'In Progress': 'in_progress',
      'Completed': 'completed',
      'Cancelled': 'cancelled',
      'open': 'open',
      'accepted': 'accepted',
      'in_progress': 'in_progress',
      'completed': 'completed',
      'cancelled': 'cancelled'
    }
    
    if (filters.status) {
      const dbStatus = statusMap[filters.status] || filters.status.toLowerCase()
      filtered = filtered.filter(r => {
        const requestStatus = statusMap[r.status] || r.status?.toLowerCase()
        return requestStatus === dbStatus
      })
    }
    if (filters.category) {
      filtered = filtered.filter(r => r.category === filters.category)
    }
    if (filters.priority) {
      filtered = filtered.filter(r => r.priority?.toLowerCase() === filters.priority.toLowerCase())
    }
    if (filters.userId) {
      filtered = filtered.filter(r => r.userId === filters.userId || r.requesterId === filters.userId)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(r => 
        r.title?.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower)
      )
    }
    
    return {
      requests: filtered,
      pagination: {
        total: filtered.length,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        hasMore: false
      }
    }
  }

  async getRequestById(requestId) {
    await this.delay(200)
    const request = this.requests.find(r => r.id === requestId || r.requestId === requestId)
    if (!request) {
      throw new Error('Request not found')
    }
    return request
  }

  async getMyRequests(userId) {
    await this.delay(200)
    const myRequests = this.requests.filter(r => 
      r.userId === userId || r.requesterId === userId
    )
    return { requests: myRequests }
  }

  async createRequest(userId, requestData) {
    try {
      await this.delay(500)
      
      // Validate input
      if (!userId || userId === 'guest') {
        throw new Error('You must be logged in to create requests')
      }
      
      if (!requestData || !requestData.title || !requestData.description) {
        throw new Error('Title and description are required')
      }
      
      const user = this.getUserById(userId)
      if (!user) {
        throw new Error('User not found. Please log in again.')
      }
      
      // Validate request data
      const validatedData = {
        title: String(requestData.title || '').trim(),
        description: String(requestData.description || '').trim(),
        category: String(requestData.category || 'General'),
        priority: String(requestData.priority || 'Medium'),
        location: String(requestData.location || user.location || 'Calgary'),
        timeNeeded: String(requestData.timeNeeded || '1 hour'),
        coordinates: requestData.coordinates || user.coordinates || { lat: 51.0447, lng: -114.0719 },
        address: String(requestData.address || user.address || ''),
        city: String(requestData.city || user.city || 'Calgary'),
        region: String(requestData.region || user.region || 'Alberta'),
        skills: Array.isArray(requestData.skills) ? requestData.skills : [],
        images: Array.isArray(requestData.images) ? requestData.images : (requestData.image ? [requestData.image] : []),
      }
      
      if (!validatedData.title || validatedData.title.length < 3) {
        throw new Error('Title must be at least 3 characters')
      }
      
      if (!validatedData.description || validatedData.description.length < 10) {
        throw new Error('Description must be at least 10 characters')
      }
      
      const newRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      requesterId: userId,
      requester: user.name || user.displayName || 'User',
      requesterName: user.name || user.displayName || 'User',
      requesterEmail: user.email || '',
      title: validatedData.title,
      description: validatedData.description,
      category: validatedData.category,
      priority: validatedData.priority,
      urgency: validatedData.priority.toLowerCase(),
      status: 'open', // Database uses 'open' not 'Active'
      location: validatedData.location,
      address: validatedData.address,
      coordinates: validatedData.coordinates,
      latitude: validatedData.coordinates?.lat,
      longitude: validatedData.coordinates?.lng,
      city: validatedData.city,
      region: validatedData.region,
      distance: null,
      timeNeeded: validatedData.timeNeeded,
      skills: validatedData.skills,
      image: validatedData.images?.[0] || null,
      images: validatedData.images,
      volunteerId: null,
      volunteerName: null,
      volunteerCount: 0,
      volunteers: [],
      aiCategory: requestData.category || 'General',
      aiPriority: requestData.priority || 'Medium',
      aiLabels: [],
      translated: false,
      originalLanguage: null,
      translatedDescription: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      rating: null,
      feedback: null,
    }
    
      // Safely add to array
      if (!Array.isArray(this.requests)) {
        this.requests = []
      }
      this.requests.push(newRequest)
      
      // Save with error handling
      try {
        this.saveToStorage('requests', this.requests)
      } catch (saveError) {
        console.error('Error saving request to storage:', saveError)
        // Continue anyway - data is in memory
      }
      
      this.notifyUpdate('request_created', newRequest)
      
      // Create notification for nearby users (non-blocking)
      try {
        this.createNotificationForNearbyUsers(newRequest)
      } catch (notifError) {
        console.error('Error creating notifications:', notifError)
        // Continue - notifications are not critical
      }
      
      return newRequest
    } catch (error) {
      console.error('Error creating request:', error)
      throw error
    }
  }

  async acceptRequest(requestId, userId) {
    try {
      await this.delay(500)
      
      // Validate input
      if (!requestId) {
        throw new Error('Request ID is required')
      }
      if (!userId || userId === 'guest') {
        throw new Error('You must be logged in to accept requests')
      }
      
      if (!Array.isArray(this.requests)) {
        this.requests = []
        throw new Error('Requests data is corrupted. Please refresh the page.')
      }
      
      const request = this.requests.find(r => r.id === requestId || r.requestId === requestId)
      if (!request) {
        throw new Error('Request not found. It may have been deleted or completed.')
      }
      
      // Check both frontend and database status values
      const unavailableStatuses = ['completed', 'cancelled', 'Completed', 'Cancelled']
      if (unavailableStatuses.includes(request.status)) {
        throw new Error('This request is no longer available')
      }
      
      // Check if already accepted by this user
      if (request.volunteers && request.volunteers.some(v => v.userId === userId)) {
        throw new Error('You have already accepted this request')
      }
      
      const user = this.getUserById(userId)
      if (!user) {
        throw new Error('User not found. Please log in again.')
      }
    
      // Add volunteer to request
      const volunteer = {
        userId: userId,
        name: user.name || user.displayName || 'User',
        acceptedAt: new Date().toISOString(),
        status: 'accepted'
      }
      
      // Safely initialize volunteers array
      if (!Array.isArray(request.volunteers)) {
        request.volunteers = []
      }
      request.volunteers.push(volunteer)
      request.volunteerId = userId
      request.volunteerName = user.name || user.displayName || 'User'
      request.volunteerCount = request.volunteers.length
      request.status = 'accepted' // Database uses 'accepted' not 'Assigned'
      request.updatedAt = new Date().toISOString()
      
      // Create volunteer activity
      const activity = {
        id: `vol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        activityId: `vol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userId,
        userName: user.name || user.displayName || 'User',
        requestId: request.id,
        requestTitle: request.title || 'Help Request',
        status: 'in_progress',
        acceptedAt: new Date().toISOString(),
        completedAt: null,
        hoursSpent: 0,
        rating: null,
        feedback: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // Safely add activity
      if (!Array.isArray(this.volunteerActivities)) {
        this.volunteerActivities = []
      }
      this.volunteerActivities.push(activity)
      
      // Update user stats safely
      if (user) {
        user.currentActiveHelps = (user.currentActiveHelps || 0) + 1
        user.updatedAt = new Date().toISOString()
      }
      
      // Save with error handling
      try {
        this.saveToStorage('requests', this.requests)
        this.saveToStorage('volunteerActivities', this.volunteerActivities)
        this.saveToStorage('users', this.users)
      } catch (saveError) {
        console.error('Error saving data:', saveError)
        // Continue - data is in memory
      }
      
      // Create conversation (non-blocking)
      try {
        this.createConversation(request.userId, userId, request.id, request.title)
      } catch (convError) {
        console.error('Error creating conversation:', convError)
      }
      
      // Create notifications (non-blocking)
      try {
        this.createNotification(request.userId, 'request_accepted', {
          title: 'Request Accepted',
          message: `Your request "${request.title}" has been accepted by ${user.name || 'a volunteer'}`,
          relatedId: request.id,
          relatedType: 'request'
        })
      } catch (notifError) {
        console.error('Error creating notification:', notifError)
      }
      
      this.notifyUpdate('request_accepted', { request, volunteer: user })
      
      return request
    } catch (error) {
      console.error('Error accepting request:', error)
      throw error
    }
  }

  async completeRequest(requestId, userId, rating = null, feedback = null) {
    await this.delay(500)
    const request = this.requests.find(r => r.id === requestId || r.requestId === requestId)
    if (!request) {
      throw new Error('Request not found')
    }
    
    request.status = 'completed' // Database uses 'completed' not 'Completed'
    request.completedAt = new Date().toISOString()
    request.rating = rating
    request.feedback = feedback
    request.updatedAt = new Date().toISOString()
    
    // Update volunteer activity
    const activity = this.volunteerActivities.find(a => 
      a.requestId === requestId && a.userId === userId
    )
    if (activity) {
      activity.status = 'completed'
      activity.completedAt = new Date().toISOString()
      activity.rating = rating
      activity.feedback = feedback
      activity.hoursSpent = request.timeNeeded ? parseFloat(request.timeNeeded) || 1 : 1
      activity.updatedAt = new Date().toISOString()
    }
    
    // Update user stats
    const volunteer = this.getUserById(userId)
    if (volunteer) {
      volunteer.totalHelps = (volunteer.totalHelps || 0) + 1
      volunteer.currentActiveHelps = Math.max((volunteer.currentActiveHelps || 0) - 1, 0)
      volunteer.hoursVolunteered = (volunteer.hoursVolunteered || 0) + (activity?.hoursSpent || 1)
      volunteer.updatedAt = new Date().toISOString()
    }
    
    this.saveToStorage('requests', this.requests)
    this.saveToStorage('volunteerActivities', this.volunteerActivities)
    this.saveToStorage('users', this.users)
    
    this.notifyUpdate('request_completed', request)
    
    return request
  }

  async deleteRequest(requestId, userId) {
    try {
      await this.delay(300)
      
      // Validate input
      if (!requestId) {
        throw new Error('Request ID is required')
      }
      if (!userId || userId === 'guest') {
        throw new Error('You must be logged in to delete requests')
      }
      
      if (!Array.isArray(this.requests)) {
        this.requests = []
        throw new Error('Requests data is corrupted. Please refresh the page.')
      }
      
      const request = this.requests.find(r => r.id === requestId || r.requestId === requestId)
      if (!request) {
        throw new Error('Request not found. It may have already been deleted.')
      }
      
      // Check authorization
      if (request.userId !== userId && request.requesterId !== userId) {
        throw new Error('You are not authorized to delete this request')
      }
      
      // Safely filter out the request
      const beforeLength = this.requests.length
      this.requests = this.requests.filter(r => r.id !== requestId && r.requestId !== requestId)
      
      // Verify deletion
      if (this.requests.length === beforeLength) {
        throw new Error('Failed to delete request. Please try again.')
      }
      
      // Save with error handling
      try {
        this.saveToStorage('requests', this.requests)
      } catch (saveError) {
        console.error('Error saving after delete:', saveError)
        // Restore if save fails
        this.requests = this.loadFromStorage('requests', [])
        throw new Error('Failed to save changes. Please try again.')
      }
      
      this.notifyUpdate('request_deleted', { requestId })
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting request:', error)
      throw error
    }
  }

  // ========== VOLUNTEER METHODS ==========
  async getVolunteerStats(userId) {
    await this.delay(200)
    const user = this.getUserById(userId)
    if (!user) {
      return {
        totalHelps: 0,
        hoursVolunteered: 0,
        currentActive: 0,
        rating: null,
        streak: 0,
      }
    }
    
    const activities = this.volunteerActivities.filter(a => a.userId === userId)
    const completed = activities.filter(a => a.status === 'completed')
    const active = activities.filter(a => a.status === 'in_progress')
    
    return {
      totalHelps: user.totalHelps || completed.length,
      hoursVolunteered: user.hoursVolunteered || completed.reduce((sum, a) => sum + (a.hoursSpent || 0), 0),
      currentActive: user.currentActiveHelps || active.length,
      rating: user.rating || null,
      streak: user.streak || 0,
    }
  }

  async getVolunteerHistory(userId) {
    await this.delay(200)
    return this.volunteerActivities
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  async getActiveOpportunities(userId) {
    await this.delay(200)
    const user = this.getUserById(userId)
    if (!user) return []
    
    // Get requests that match user's skills and are not already accepted
    // Check both 'open' (database) and 'Active' (frontend) status
    return this.requests.filter(r => 
      (r.status === 'open' || r.status === 'Active') &&
      !r.volunteers.find(v => v.userId === userId) &&
      (r.skills.length === 0 || r.skills.some(skill => 
        user.skillsOffered?.includes(skill) || user.skills?.includes(skill)
      ))
    )
  }

  async getOpportunities(filters = {}) {
    await this.delay(200)
    // Get userId from sessionStorage/localStorage
    const userId = sessionStorage.getItem('currentUserId') || sessionStorage.getItem('firebase_user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('firebase_user_id')
    
    if (!userId) {
      // Return all open requests if no user
      return this.requests.filter(r => r.status === 'open' || r.status === 'Active')
    }
    
    // Get opportunities for the user
    let opportunities = await this.getActiveOpportunities(userId)
    
    // Apply filters
    if (filters.category) {
      opportunities = opportunities.filter(r => r.category === filters.category)
    }
    if (filters.urgency) {
      opportunities = opportunities.filter(r => r.urgency === filters.urgency)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      opportunities = opportunities.filter(r => 
        r.title?.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower)
      )
    }
    
    return opportunities
  }

  async getMyHelps() {
    await this.delay(200)
    // Get userId from sessionStorage/localStorage
    const userId = sessionStorage.getItem('currentUserId') || sessionStorage.getItem('firebase_user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('firebase_user_id')
    
    if (!userId) {
      return []
    }
    
    // Return user's active volunteer activities
    return this.volunteerActivities
      .filter(a => a.userId === userId && (a.status === 'in_progress' || a.status === 'accepted'))
      .map(a => {
        const request = this.requests.find(r => r.id === a.requestId || r.requestId === a.requestId)
        return {
          ...a,
          request: request || null
        }
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  async getAchievements() {
    await this.delay(200)
    // Get userId from sessionStorage/localStorage
    const userId = sessionStorage.getItem('currentUserId') || sessionStorage.getItem('firebase_user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('firebase_user_id')
    
    if (!userId) {
      return []
    }
    
    // Return achievements for the current user
    return this.achievements
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.unlockedAt || b.createdAt) - new Date(a.unlockedAt || a.createdAt))
  }

  // ========== BUSINESSES METHODS ==========
  async getBusinesses(filters = {}) {
    await this.delay(200)
    let filtered = [...this.businesses]
    
    if (filters.category) {
      filtered = filtered.filter(b => b.category === filters.category)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(b => 
        b.name?.toLowerCase().includes(searchLower) ||
        b.description?.toLowerCase().includes(searchLower)
      )
    }
    
    return filtered
  }

  async createBusiness(userId, businessData) {
    await this.delay(500)
    const user = this.getUserById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    
    const newBusiness = {
      id: `biz_${Date.now()}`,
      businessId: `biz_${Date.now()}`,
      name: businessData.name,
      type: businessData.type,
      category: businessData.category,
      description: businessData.description,
      ownerId: userId,
      location: businessData.location,
      address: businessData.address,
      coordinates: businessData.coordinates,
      latitude: businessData.coordinates?.lat,
      longitude: businessData.coordinates?.lng,
      city: businessData.city || 'Calgary',
      region: businessData.region || 'Alberta',
      postalCode: businessData.postalCode,
      accessibilityFeatures: businessData.accessibilityFeatures || [],
      accessibilityRating: null,
      accessibilityReviews: 0,
      phone: businessData.phone,
      email: businessData.email,
      website: businessData.website,
      hours: businessData.hours,
      sensoryFriendlyHours: businessData.sensoryFriendlyHours,
      languages: businessData.languages || ['en'],
      aslTrained: businessData.aslTrained || false,
      accessCardAccepted: businessData.accessCardAccepted || false,
      verified: false,
      verifiedBy: null,
      verifiedAt: null,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    this.businesses.push(newBusiness)
    this.saveToStorage('businesses', this.businesses)
    this.notifyUpdate('business_created', newBusiness)
    
    return newBusiness
  }

  // ========== LOCATIONS METHODS ==========
  async getLocations(filters = {}) {
    await this.delay(200)
    let filtered = [...this.locations]
    
    if (filters.type) {
      filtered = filtered.filter(l => l.type === filters.type)
    }
    
    return filtered
  }

  // ========== NOTIFICATIONS METHODS ==========
  async getNotifications(userId, filters = {}) {
    await this.delay(200)
    let notifications = this.notifications.filter(n => n.userId === userId)
    
    if (filters.read !== undefined) {
      notifications = notifications.filter(n => n.read === filters.read)
    }
    
    return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  createNotification(userId, type, data) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notificationId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      type: type,
      title: data.title,
      message: data.message,
      relatedId: data.relatedId,
      relatedType: data.relatedType || 'request',
      read: false,
      readAt: null,
      createdAt: new Date().toISOString(),
    }
    
    this.notifications.push(notification)
    this.saveToStorage('notifications', this.notifications)
    this.notifyUpdate('notification_created', notification)
    
    return notification
  }

  createNotificationForNearbyUsers(request) {
    // Notify users within 5km radius
    const nearbyUsers = this.users.filter(u => {
      if (!u.coordinates || !request.coordinates) return false
      const distance = this.calculateDistance(
        u.coordinates.lat, u.coordinates.lng,
        request.coordinates.lat, request.coordinates.lng
      )
      return distance <= 5 // 5km radius
    })
    
    nearbyUsers.forEach(user => {
      if (user.id !== request.userId) {
        this.createNotification(user.id, 'new_request_nearby', {
          title: 'New Request Nearby',
          message: `A new request "${request.title}" was posted near you`,
          relatedId: request.id,
          relatedType: 'request'
        })
      }
    })
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // ========== CONVERSATIONS METHODS ==========
  createConversation(userId1, userId2, requestId, requestTitle) {
    const existing = this.conversations.find(c => 
      c.participants.includes(userId1) && c.participants.includes(userId2) &&
      c.requestId === requestId
    )
    
    if (existing) return existing
    
    const user1 = this.getUserById(userId1)
    const user2 = this.getUserById(userId2)
    
    const conversation = {
      id: `conv_${Date.now()}`,
      conversationId: `conv_${Date.now()}`,
      participants: [userId1, userId2],
      participantNames: [user1?.name || user1?.displayName, user2?.name || user2?.displayName],
      requestId: requestId,
      requestTitle: requestTitle,
      lastMessage: null,
      lastMessageAt: new Date().toISOString(),
      unreadCount: { [userId1]: 0, [userId2]: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    this.conversations.push(conversation)
    this.saveToStorage('conversations', this.conversations)
    
    return conversation
  }

  // ========== CITY AUTHORITY METHODS ==========
  async checkCityAuthorityStatus(userId) {
    await this.delay(200)
    const authority = this.cityAuthorities.find(a => a.userId === userId)
    return {
      isVerified: authority?.verified || false,
      status: authority?.status || 'not_verified',
      authority: authority || null
    }
  }

  async requestCityAuthorityVerification(userId, data) {
    await this.delay(500)
    const existing = this.cityAuthorities.find(a => a.userId === userId)
    
    if (existing) {
      existing.status = 'pending'
      existing.updatedAt = new Date().toISOString()
      this.saveToStorage('cityAuthorities', this.cityAuthorities)
      return existing
    }
    
    const newAuthority = {
      id: `city_${Date.now()}`,
      authorityId: `city_${Date.now()}`,
      userId: userId,
      userName: data.name,
      email: data.email,
      governmentEmail: data.governmentEmail,
      department: data.department,
      position: data.position,
      status: 'pending',
      verified: false,
      verifiedBy: null,
      verifiedAt: null,
      documents: data.documents || [],
      reason: data.reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    this.cityAuthorities.push(newAuthority)
    this.saveToStorage('cityAuthorities', this.cityAuthorities)
    
    // Auto-approve in mock mode
    setTimeout(() => {
      newAuthority.status = 'verified'
      newAuthority.verified = true
      newAuthority.verifiedBy = 'system'
      newAuthority.verifiedAt = new Date().toISOString()
      this.saveToStorage('cityAuthorities', this.cityAuthorities)
      this.notifyUpdate('city_authority_verified', newAuthority)
    }, 2000)
    
    return newAuthority
  }
}

// Create singleton instance
const mockBackend = new CompleteMockBackend()

export default mockBackend
