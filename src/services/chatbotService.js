// AI Chatbot Service - Expert Assistant for Burrowly Application
// Uses Hugging Face Inference API (free, no API key required for public models)

// Comprehensive application knowledge base
const APP_KNOWLEDGE_BASE = `
# BURROWLY APPLICATION - COMPLETE GUIDE

## APPLICATION OVERVIEW
Burrowly is an AI-Powered Neighborhood Resilience Network that connects neighbors in need with nearby helpers to build stronger, more resilient communities. The platform focuses on accessibility, inclusivity, and community support.

## AUTHENTICATION & ACCESS
- Users must log in to access dashboard features
- Login page: /login
- Sign up creates a new account with email, password, and name
- Session-based authentication - users must log in each time they open the app
- Guest users have limited access (can view but cannot create requests)

## MAIN NAVIGATION STRUCTURE

### HOME PAGE (/)
- Landing page with hero section
- Navigation links: HOME, ABOUT, HOW IT WORKS, COMMUNITY, CONTACT
- "Learn More" button opens modal with app information
- "Get Started" button navigates to login
- Accessibility settings in navbar (gear icon)
- Binoo chatbot button (bottom right) - "Get Help"
- Contact modal with email (ronakhjr@gmail.com) and phone (587-971-5138)

### USER DASHBOARD (/dashboard/user)
Main dashboard for regular users showing:
- Welcome message and quick stats:
  * Nearby Requests count
  * Active Helps (requests user is helping with)
  * Completed Helps (successfully completed)
- Nearby Requests section (3 most recent)
- My Requests section (user's own requests)
- Quick Actions buttons:
  * View Map - Shows interactive map with all requests
  * Roadmap - Accessibility guide and resources
  * Volunteer - Volunteer hub with opportunities
  * Help Requests - Full list of all help requests
- "Request Help" button (top right) - Opens form to create new request

### CITY AUTHORITIES DASHBOARD (/dashboard/city)
Dashboard for city officials and government:
- Requires verification (CityAuthorityVerification component)
- Shows statistics:
  * Total Requests
  * Active Requests
  * Completed Today
  * Average Response Time
  * Verified Workers
  * Pending Verifications
- Recent Help Requests list
- Pending Verifications section (approve/reject workers)
- "View All" button to see all requests
- "Open Map View" button for geographic visualization

## KEY FEATURES & PAGES

### HELP REQUESTS (/dashboard/user/requests or /dashboard/city/requests)
Comprehensive request management:
- List View: Shows all help requests with filters
- Map View: Interactive map showing request locations
- Search bar to find specific requests
- Filters: Category, Priority, Status
- Request cards show: Title, Description, Location, Priority, Status, Time
- Actions:
  * Accept Request - Volunteer to help
  * View Details - See full request information
  * Complete Request - Mark as finished
  * Delete Request - Remove (only for request creator)
- "Create Request" button (top right)
- Request form fields:
  * Title (required, min 3 characters)
  * Description (required, min 10 characters)
  * Category (Accessibility, Medical, Community, Safety, etc.)
  * Priority (Low, Medium, High, Urgent)
  * Location
  * Time Needed

### MAP VIEW (/dashboard/user/map or /dashboard/city/map)
Interactive Mapbox map showing:
- Help Requests (red markers with clustering)
- Accessible Businesses (blue markers)
- Special Needs Locations (green markers)
- Accessible Routes (purple lines)
- Accessible Zones (purple polygons)
- User Location (blue pulsing marker)
- Layer toggles to filter what's visible
- "Show Accessible Roads" toggle
- Click markers to see details
- Legend sidebar on left showing all layer types

### ROADMAP (/dashboard/user/roadmap or /dashboard/city/roadmap)
Inclusive Access Navigator with sections:
1. Business Access Info
   - Businesses with accessibility features
   - Sensory-friendly hours
   - ASL-trained staff
   - Access card acceptance
2. Accessible Transportation
   - Calgary Transit Access
   - Paratransit services
   - Volunteer ride programs
3. Pathfinder Tools
   - Step-by-step guides for services
   - "How to get..." instructions
4. Inclusive Deals & Initiatives
   - Community discounts
   - Volunteer-supported services
5. Support Services
   - Local nonprofits
   - Community centers
   - Helplines

### VOLUNTEER HUB (/dashboard/user/volunteer)
Complete volunteer management:
- Stats Overview:
  * Total Helps
  * Hours Volunteered
  * Active Helps
  * Rating
  * Day Streak
- Tabs:
  * Opportunities - Available requests to help with
  * My Active Helps - Requests user is currently helping
  * Achievements - Badges and milestones
  * History - Past volunteer work
- Actions:
  * Accept Opportunity - Volunteer for a request
  * Mark Complete - Finish helping
  * View Details - See request information
- Filters: All, High Priority, Nearby, Elderly Care, Accessibility, Community

## BUTTONS & ACTIONS

### Navigation Buttons
- "Log In" / "Join Now" (navbar) → /login
- "View Map" → /dashboard/user/map
- "Roadmap" → /dashboard/user/roadmap
- "Volunteer" → /dashboard/user/volunteer
- "Help Requests" → /dashboard/user/requests
- "Request Help" → Opens request creation form
- "View All" → Shows all requests
- "Open Map View" → Opens map visualization

### Action Buttons
- "Accept" / "Accept Request" → Volunteer to help with a request
- "Complete" / "Mark Complete" → Finish helping with a request
- "Delete" → Remove a request (only creator can delete)
- "Create Request" → Open form to create new help request
- "Approve" / "Reject" → City authority verifies workers
- "Contact Us" → Opens contact modal with email/phone

### Form Buttons
- "Submit" → Submit form (request, signup, etc.)
- "Cancel" → Close form without saving
- "Get Started" → Navigate to login or dashboard

## REQUEST CATEGORIES
- Accessibility
- Medical
- Community
- Safety
- Language Support
- Elderly Care
- General

## REQUEST PRIORITIES
- Low
- Medium
- High
- Urgent

## REQUEST STATUSES
- Active - Open and waiting for help
- Assigned - Someone has accepted to help
- Completed - Successfully finished
- Cancelled - Request was cancelled

## USER ROLES
- User - Regular community member
- City Authority - Government/official (requires verification)
- Guest - Unauthenticated user (limited access)

## ACCESSIBILITY FEATURES
- Font size adjustment (0.8x to 2x)
- Zoom level control (50% to 200%)
- High contrast mode
- Color blindness filters (Protanopia, Deuteranopia, Tritanopia)
- ADHD Focus Mode
- Sensory-Friendly Mode
- Text highlighting
- Reduce motion
- Text-to-speech

## DATA & STATISTICS
- All data is user-specific and updates in real-time
- Requests are linked to user IDs
- Volunteer activities track hours, ratings, streaks
- City dashboard shows aggregate community statistics
- Map shows real-time locations and accessible infrastructure

## COMMON USER QUESTIONS & ANSWERS

Q: How do I create a help request?
A: Click "Request Help" button on User Dashboard, or "Create Request" on Help Requests page. Fill in title (min 3 chars), description (min 10 chars), category, priority, and location. Click Submit.

Q: How do I volunteer to help?
A: Go to Volunteer Hub tab, see Opportunities, click "Accept Opportunity" on any request you want to help with. Or go to Help Requests page and click "Accept" on any request.

Q: How do I see requests on a map?
A: Click "View Map" quick action button, or go to Help Requests and switch to Map View using the toggle buttons.

Q: What is the Roadmap?
A: Roadmap is an accessibility guide showing accessible businesses, transportation options, support services, and step-by-step guides for getting help.

Q: How do I become a city authority?
A: Access City Dashboard, you'll see a verification form. Fill in your government information, department, position, and submit documents for verification.

Q: How do I complete a request I'm helping with?
A: Go to Volunteer Hub → My Active Helps tab, find the request, click "Mark Complete". Or on Help Requests page, if you accepted a request, click "Complete".

Q: Can I delete my request?
A: Yes, only the creator can delete their own request. Go to Help Requests, find your request, click Delete button.

Q: What are the quick action buttons for?
A: They provide quick navigation: View Map (see all on map), Roadmap (accessibility guide), Volunteer (volunteer hub), Help Requests (all requests list).

Q: How do I filter requests?
A: On Help Requests page, use the search bar, category dropdown, priority dropdown, and status dropdown to filter.

Q: What does the map show?
A: Map shows help requests (red), accessible businesses (blue), special needs locations (green), accessible routes (purple lines), and your location (blue pulsing marker).

Q: How do I see my volunteer stats?
A: Go to Volunteer Hub, stats are shown at the top: Total Helps, Hours, Active Helps, Rating, Streak.

Q: What are achievements?
A: Badges you earn for volunteering milestones like "First Help", "7 Day Streak", "50 Helps", etc. View in Volunteer Hub → Achievements tab.

Q: How do I change accessibility settings?
A: Click the gear icon in navbar, adjust font size, contrast, color blindness filters, ADHD mode, sensory-friendly mode, etc.

Q: How do I contact support?
A: Click "Contact Us" button or use the contact modal. Email: ronakhjr@gmail.com, Phone: (587) 971-5138.

Q: What if I'm not logged in?
A: You can view the home page and some public information, but cannot create requests or access dashboard features. Click "Log In" or "Join Now" to sign up.

Q: How do I switch between user and city view?
A: Use the toggle in DashboardLayout navbar - "Community" for user view, "City Authorities" for city view.

Q: What information does the city dashboard show?
A: Total requests, active requests, completed today, average response time, verified workers count, and pending verifications that need approval.

Q: How do I verify workers as city authority?
A: On City Dashboard, scroll to Pending Verifications section, review each worker's information, click "Approve" or "Reject".

Q: Can I see my own requests?
A: Yes, on User Dashboard there's a "My Requests" section showing all requests you created.

Q: How do I accept a nearby request?
A: On User Dashboard, see "Nearby Requests" section, click "Accept" on any request. Or go to Help Requests page and accept from there.

Q: What happens when I accept a request?
A: The request status changes to "Assigned", you appear as the volunteer, a conversation is created, and the requester gets notified.

Q: How do I complete a request?
A: After helping, go to Volunteer Hub → My Active Helps, click "Mark Complete". This updates your stats and marks the request as completed.

Q: What is the difference between list and map view?
A: List view shows requests as cards in a list format. Map view shows them as markers on an interactive map with your location.

Q: How do I search for specific requests?
A: Use the search bar on Help Requests page. It searches in title, description, and location fields.

Q: What categories can I choose for a request?
A: Accessibility, Medical, Community, Safety, Language Support, Elderly Care, or General.

Q: How do I set request priority?
A: When creating a request, select from Low, Medium, High, or Urgent priority dropdown.

Q: What does the volunteer rating mean?
A: Your average rating from people you've helped. Higher rating (up to 5.0) shows you're a reliable volunteer.

Q: What is a day streak?
A: Consecutive days you've helped someone. Helps build your reputation and shows consistent community involvement.

Q: How do I see accessible businesses?
A: Go to Roadmap page → Business Access Info section, or use Map View and toggle on "Accessible Businesses" layer.

Q: How do I find transportation help?
A: Go to Roadmap page → Accessible Transportation section for transit options, paratransit, and ride programs.

Q: How do I get step-by-step help for services?
A: Go to Roadmap page → Pathfinder Tools section for guides on how to access various services and resources.

Q: What support services are available?
A: Go to Roadmap page → Support Services section for nonprofits, community centers, helplines, and support organizations.

Q: How do I see my volunteer history?
A: Go to Volunteer Hub → History tab to see all past volunteer work with dates, hours, and ratings.

Q: How do I see my achievements?
A: Go to Volunteer Hub → Achievements tab to see all badges and milestones you've earned.

Q: Can I see requests I've accepted?
A: Yes, go to Volunteer Hub → My Active Helps tab to see all requests you're currently helping with.

Q: How do I navigate between pages?
A: Use sidebar navigation in dashboard, or quick action buttons, or browser back/forward buttons.

Q: What if I forget my password?
A: On login page, there should be a "Forgot Password" option (if implemented) or contact support.

Q: How do I update my profile?
A: Profile updates can be done through user settings (if implemented) or contact support for account changes.

Q: What data is shown on the map?
A: Help requests (red markers), accessible businesses (blue), special needs locations (green), accessible routes/zones (purple), and your location.

Q: How do I toggle map layers?
A: On Map View, use the layer toggle buttons in the map controls to show/hide different types of markers.

Q: How do I see accessible roads?
A: On Map View, click "Show Accessible Roads" toggle button to display accessible routes and zones.

Q: What does the legend show?
A: The legend sidebar on the left of map view explains what each marker color and symbol means.

Q: How do I see request details?
A: Click on any request card or map marker to see full details including description, location, priority, status, and actions.

Q: Can I filter requests by my location?
A: Requests are automatically sorted by distance. Use the map view to see requests near your location.

Q: How do I know if a request is urgent?
A: Urgent requests are marked with "Urgent" priority badge and appear at the top of lists. They're also highlighted on the map.

Q: What happens after I create a request?
A: Your request appears in the system, nearby volunteers get notified, and you can see it in "My Requests" section.

Q: How do I know if someone accepted my request?
A: You'll receive a notification, the request status changes to "Assigned", and you can see the volunteer's name.

Q: Can I cancel a request?
A: Yes, if you're the creator, you can delete your request using the Delete button (only before it's completed).

Q: How do I rate a volunteer?
A: After a request is completed, you may be able to rate the volunteer (if rating system is implemented).

Q: What information do I need to create a request?
A: Title (required), Description (required), Category, Priority, Location, and estimated Time Needed.

Q: How do I see all my requests?
A: On User Dashboard, see "My Requests" section, or go to Help Requests page and filter by your user ID.

Q: How do I see requests I'm helping with?
A: Go to Volunteer Hub → My Active Helps tab to see all active requests you've accepted.

Q: What is the difference between user and city dashboard?
A: User dashboard is for community members to request/offer help. City dashboard is for officials to monitor and manage community resilience.

Q: How do I access city dashboard?
A: You need city authority verification. Use the toggle in dashboard to switch to "City Authorities" view, then complete verification.

Q: What can city authorities do?
A: View community statistics, monitor all requests, verify workers, see heatmaps, track response times, and manage verifications.

Q: How do I verify as city authority?
A: Access city dashboard, fill out verification form with government email, department, position, and submit documents.

Q: What statistics are shown on city dashboard?
A: Total requests, active requests, completed today, average response time, verified workers count, pending verifications.

Q: How do I approve a worker verification?
A: On City Dashboard → Pending Verifications, review worker info, click "Approve" button.

Q: How do I reject a worker verification?
A: On City Dashboard → Pending Verifications, review worker info, click "Reject" button.

Q: What is the roadmap used for?
A: Roadmap is an accessibility navigator helping users find accessible businesses, transportation, support services, and step-by-step guides.

Q: How do I find accessible businesses?
A: Go to Roadmap → Business Access Info section, or use Map View and enable "Accessible Businesses" layer.

Q: What transportation options are shown?
A: Roadmap shows Calgary Transit Access, paratransit services, volunteer ride programs, and accessible transportation options.

Q: How do I use pathfinder tools?
A: Go to Roadmap → Pathfinder Tools section for step-by-step guides on accessing services like medical care, housing, support cards.

Q: What deals are available?
A: Roadmap shows inclusive deals like community discounts, volunteer-supported services, and special offers for users with access cards.

Q: How do I find support services?
A: Go to Roadmap → Support Services section for local nonprofits, community centers, helplines, and support organizations.

Q: What are the quick actions for?
A: Quick action buttons provide fast navigation to key features: Map View, Roadmap, Volunteer Hub, and Help Requests.

Q: How do I see my volunteer statistics?
A: Go to Volunteer Hub, statistics are displayed at the top: Total Helps, Hours Volunteered, Active Helps, Rating, Day Streak.

Q: What achievements can I earn?
A: Achievements include First Help, 10 Helps, 50 Helps, 100 Helps, Week Streak, Month Streak, Elderly Care Specialist, Accessibility Champion.

Q: How do I see my volunteer history?
A: Go to Volunteer Hub → History tab to see all past volunteer work with completion dates, hours spent, and ratings received.

Q: How do I accept an opportunity?
A: Go to Volunteer Hub → Opportunities tab, browse available requests, click "Accept Opportunity" on any you want to help with.

Q: How do I mark a help as complete?
A: Go to Volunteer Hub → My Active Helps tab, find the request you're helping with, click "Mark Complete" button.

Q: What filters are available for opportunities?
A: Filter by All, High Priority, Nearby, Elderly Care, Accessibility, or Community categories.

Q: How do I see request details?
A: Click on any request card in list view, or click a marker on map view, or use "View Details" button.

Q: Can I chat with the requester?
A: After accepting a request, a conversation is created. Chat functionality may be available (check for chat/messaging features).

Q: How do I navigate the application?
A: Use sidebar navigation in dashboard, quick action buttons, or direct URL navigation. All routes are protected and require login.

Q: What happens when I log out?
A: All session data is cleared, you're redirected to home page, and you must log in again to access dashboard features.

Q: How do I change my password?
A: Password changes may be available through account settings or contact support for assistance.

Q: What if I have accessibility needs?
A: Use the accessibility settings (gear icon) to adjust font size, contrast, color filters, motion reduction, and text-to-speech.

Q: How do I report a problem?
A: Use the Contact Us button/modal to reach support via email (ronakhjr@gmail.com) or phone (587-971-5138).

Q: What languages are supported?
A: The app supports multiple languages with AI translation. Check language settings or contact support for available languages.

Q: How do I see my notifications?
A: Notifications appear in the notification center (if implemented) or you'll see notification badges on relevant sections.

Q: How do I mark notifications as read?
A: Click on notifications or use "Mark as Read" option if available in notification center.

Q: What is real-time updating?
A: Data updates automatically every 10 seconds, so you see the latest requests, stats, and information without refreshing.

Q: How do I refresh data?
A: Data refreshes automatically every 10 seconds. You can also refresh the page or navigate away and back.

Q: What information is shown on request cards?
A: Title, description, requester name, location, distance, priority badge, status, time posted, volunteer count, and action buttons.

Q: How do I know if a request is nearby?
A: Requests show distance (e.g., "0.3 mi"), and map view shows your location relative to requests.

Q: What skills are needed for requests?
A: Requests may list required skills like "Shopping", "Physical labor", "Translation", "Elderly care", etc.

Q: How do I see what skills are needed?
A: Request cards and details show the skills/requirements needed to help with that request.

Q: Can I see requests from other cities?
A: Currently focused on Calgary, but the system supports multiple cities. Filter by city if available.

Q: How do I change my location?
A: Location is set during signup or can be updated in profile settings (if available).

Q: What is the purpose of the map view?
A: Map view provides visual representation of all requests, accessible infrastructure, and your location for better spatial understanding.

Q: How do I zoom on the map?
A: Use mouse wheel, pinch gesture on mobile, or map zoom controls (+/- buttons).

Q: How do I see my location on map?
A: Your location appears as a blue pulsing marker. The map centers on your location when first loaded.

Q: What do the different marker colors mean?
A: Red = Help Requests, Blue = Accessible Businesses, Green = Special Needs Locations, Blue Pulsing = Your Location.

Q: How do I see accessible routes?
A: Enable "Show Accessible Roads" toggle on map view to see accessible routes (purple lines) and zones (purple polygons).

Q: What is clustering on the map?
A: When many markers are close together, they cluster into a single marker with a number showing how many are in that area.

Q: How do I see individual requests in a cluster?
A: Zoom in on the map to see individual markers, or click the cluster to expand it.

Q: How do I filter what's shown on map?
A: Use layer toggle buttons to show/hide different types: Requests, Businesses, Special Needs, Accessible Roads.

Q: What information appears in map popups?
A: When clicking a marker, popup shows request/business name, description, location, priority, status, and action buttons.

Q: How do I navigate to a request location?
A: Click on request marker, see address in popup, use external map apps or navigation if "Get Directions" is available.

Q: What is the legend sidebar?
A: Left sidebar on map view explaining what each marker type, color, and symbol represents.

Q: How do I switch between list and map view?
A: Use view toggle buttons (list icon and map icon) in the top right of Help Requests page.

Q: What is the default view?
A: List view is default, but if you access /dashboard/user/map route, map view opens by default.

Q: How do I create a request from map view?
A: Click "Create Request" button (top right), fill form, and your request will appear on the map.

Q: How do I see my own requests on map?
A: Your requests appear as red markers. They may be highlighted differently or show a special indicator.

Q: Can I see requests I've accepted on map?
A: Yes, requests you've accepted appear on the map and may be highlighted or marked differently.

Q: How do I complete a request from map view?
A: Click on the request marker you accepted, see popup with details, click "Complete" or "Mark Complete" button.

Q: What is the purpose of the roadmap?
A: Roadmap helps users with accessibility needs find resources, services, transportation, and step-by-step guides for accessing help.

Q: How do I find businesses that accept access cards?
A: Go to Roadmap → Business Access Info, look for businesses marked as "Access Card Accepted" or check map view.

Q: What are sensory-friendly hours?
A: Some businesses offer special hours with reduced noise, lighting, and crowds for sensory-sensitive individuals. Check Business Access Info.

Q: How do I find ASL-trained staff?
A: Go to Roadmap → Business Access Info, filter for businesses with "ASL Trained" or "ASL-trained staff" feature.

Q: What transportation services are available?
A: Roadmap shows Calgary Transit Access (paratransit), volunteer ride programs, accessible transit options, and eligibility information.

Q: How do I apply for paratransit?
A: Roadmap → Accessible Transportation section provides information and links to apply for Calgary Transit Access.

Q: What are pathfinder tools?
A: Step-by-step guides helping users navigate complex processes like getting medical care, housing, support cards, or services.

Q: How do I use a pathfinder?
A: Go to Roadmap → Pathfinder Tools, select the service you need help with, follow the visual step-by-step guide.

Q: What deals are available for community members?
A: Roadmap shows inclusive deals like 2-for-1 entry for support workers, free delivery for mobility-limited seniors, community discounts.

Q: How do I find local support services?
A: Go to Roadmap → Support Services section for nonprofits (Autism Calgary, CNIB), community centers, helplines, and support organizations.

Q: How do I contact a support service?
A: Support Services section shows contact information including phone numbers, emails, and addresses for each service.

Q: What is the volunteer hub?
A: Central place for volunteers to see opportunities, track their helping history, view achievements, and manage active helps.

Q: How do I become a volunteer?
A: Simply accept any help request! There's no separate signup - accepting a request makes you a volunteer.

Q: What are volunteer stats?
A: Statistics showing your impact: Total Helps (number of requests helped), Hours Volunteered, Active Helps (currently helping), Rating, Day Streak.

Q: How do I increase my rating?
A: Complete helps successfully, be reliable, and provide good service. Requesters may rate you after completion.

Q: What is a day streak?
A: Consecutive days you've helped someone. Helps build reputation and shows consistent community involvement.

Q: How do I maintain my streak?
A: Help at least one person each day. Missing a day resets the streak to 0.

Q: What achievements can I unlock?
A: First Help, 10 Helps, 50 Helps, 100 Helps, Week Streak (7 days), Month Streak (30 days), Elderly Care Specialist, Accessibility Champion.

Q: How do I see my achievements?
A: Go to Volunteer Hub → Achievements tab to see all badges, which are earned, and progress toward unearned ones.

Q: What is the opportunities tab?
A: Shows all available help requests you can volunteer for, filtered by your preferences and sorted by priority/distance.

Q: How do I filter opportunities?
A: Use filter buttons: All, High Priority, Nearby, Elderly Care, Accessibility, Community to see specific types.

Q: What is My Active Helps tab?
A: Shows all requests you've accepted and are currently helping with, including status and completion options.

Q: What is the history tab?
A: Shows all past volunteer work you've completed, with dates, hours spent, and ratings received.

Q: How do I see how many hours I've volunteered?
A: Check Volunteer Hub stats at the top - "Hours Volunteered" shows total hours spent helping.

Q: How do I see my current active helps?
A: Go to Volunteer Hub → My Active Helps tab, or check the "Active Helps" stat on the main dashboard.

Q: How do I contact someone I'm helping?
A: After accepting a request, a conversation is created. Look for chat/messaging features to communicate.

Q: What information do I see about opportunities?
A: Title, description, requester, distance, urgency, category, time needed, skills required, and reward/badge information.

Q: How do I know which requests need help most?
A: High Priority and Urgent requests are highlighted. They appear at the top of lists and are marked with priority badges.

Q: What happens when I accept an opportunity?
A: Request status changes to "Assigned", you're added as volunteer, conversation is created, requester is notified, and it moves to "My Active Helps".

Q: How do I complete a help?
A: Go to Volunteer Hub → My Active Helps, find the request, click "Mark Complete". This updates your stats and marks request as completed.

Q: Can I see requests I've completed?
A: Yes, go to Volunteer Hub → History tab to see all completed helps with dates, hours, and ratings.

Q: How do I see my rating?
A: Check Volunteer Hub stats - "Your Rating" shows your average rating (out of 5.0) from people you've helped.

Q: What do the stats mean on user dashboard?
A: Nearby Requests = count of active requests near you, Active Helps = requests you're currently helping, Completed Helps = successfully finished.

Q: How do I see nearby requests?
A: User Dashboard shows "Nearby Requests" section with 3 most recent. Click "View All" or go to Help Requests page for full list.

Q: How do I see my own requests?
A: User Dashboard shows "My Requests" section. Or go to Help Requests page and filter to see only your requests.

Q: What information is shown for my requests?
A: Title, status, volunteer name (if accepted), time posted, and actions like view, edit, or delete.

Q: How do I know if someone accepted my request?
A: You'll receive a notification, request status changes to "Assigned", and volunteer's name appears on the request.

Q: Can I see who accepted my request?
A: Yes, the volunteer's name appears on your request card and in request details.

Q: How do I create a new request?
A: Click "Request Help" button (top right of User Dashboard) or "Create Request" on Help Requests page, fill form, submit.

Q: What is required to create a request?
A: Title (minimum 3 characters), Description (minimum 10 characters), Category, Priority, Location, and Time Needed estimate.

Q: Can I add images to requests?
A: Request form may support image upload. Check for image upload field when creating a request.

Q: How do I edit my request?
A: Editing may be available through request details. Click on your request to see if edit option is available.

Q: Can I cancel a request?
A: Yes, if you're the creator, you can delete your request using the Delete button (only before completion).

Q: What happens when I delete a request?
A: Request is removed from the system, volunteers are notified, and it disappears from all lists and maps.

Q: How do I see request statistics?
A: User Dashboard shows your personal stats. City Dashboard shows community-wide statistics.

Q: What is the city dashboard used for?
A: City authorities use it to monitor community resilience, track requests, verify workers, see response times, and manage the platform.

Q: How do I access city dashboard?
A: Switch to "City Authorities" view using the toggle, then complete verification if not already verified.

Q: What verification is needed for city dashboard?
A: Submit verification form with full name, email, government email, organization, department, position, phone, documents, and reason for access.

Q: How do I verify workers?
A: On City Dashboard → Pending Verifications section, review each worker's information and documents, click Approve or Reject.

Q: What information do I see about pending verifications?
A: Worker name, role, submission time, number of documents submitted, and action buttons (Approve, Review, Reject).

Q: How do I see all requests as city authority?
A: City Dashboard shows recent requests. Click "View All" button or go to /dashboard/city/requests for full list.

Q: What statistics are available on city dashboard?
A: Total Requests, Active Requests, Completed Today, Average Response Time, Verified Workers count, Pending Verifications count.

Q: How do I see response time trends?
A: City Dashboard may show response time trends. Check analytics section or contact support for detailed analytics.

Q: What is the heatmap feature?
A: Visual representation showing request density across the city, helping identify areas needing more support.

Q: How do I see the heatmap?
A: Click "Open Map View" on City Dashboard to see geographic visualization of all requests and their distribution.

Q: How do I filter requests by category?
A: On Help Requests page, use Category dropdown filter to show only specific categories like Accessibility, Medical, etc.

Q: How do I filter by priority?
A: Use Priority dropdown on Help Requests page to filter by Low, Medium, High, or Urgent priority.

Q: How do I filter by status?
A: Use Status dropdown to filter by Active, Assigned, Completed, or Cancelled requests.

Q: How do I search for specific text?
A: Use search bar on Help Requests page to search in request titles, descriptions, and locations.

Q: What happens when I combine filters?
A: Filters work together - you can search by text AND filter by category AND priority AND status simultaneously.

Q: How do I clear filters?
A: Set dropdowns back to "All" and clear search bar to remove all filters and see all requests.

Q: How do I see request details?
A: Click on any request card in list view, click a marker on map view, or use "View Details" button.

Q: What information is in request details?
A: Full description, requester information, exact location, coordinates, priority, status, volunteer information, timestamps, and all actions.

Q: Can I see request history?
A: Completed and cancelled requests remain visible. Filter by status to see historical requests.

Q: How do I know if a request is urgent?
A: Urgent requests have "Urgent" priority badge, appear at top of lists, and are highlighted in red/orange.

Q: What does "Nearby" mean?
A: Requests within a reasonable distance from your location, typically shown with distance like "0.3 mi" or "1.2 mi".

Q: How is distance calculated?
A: Based on your location coordinates and request location coordinates using geographic distance calculation.

Q: How do I update my location?
A: Location is detected automatically or set during signup. Update through profile settings if available.

Q: What if location detection fails?
A: Default location (Calgary downtown) is used. You can manually set location in request creation form.

Q: How do I see my location on map?
A: Your location appears as a blue pulsing marker. Map centers on your location when first loaded.

Q: How do I navigate to a request location?
A: Click request marker, see address in popup, use "Get Directions" if available, or copy address to external map app.

Q: What is the purpose of the sidebar navigation?
A: Provides quick access to all main dashboard sections: Home, Help Requests, Map View, Roadmap, Volunteer Hub.

Q: How do I know which page I'm on?
A: Active navigation item is highlighted. Current route is also shown in browser address bar.

Q: How do I switch between user and city view?
A: Use the toggle in DashboardLayout navbar - "Community" button for user view, "City Authorities" for city view.

Q: What is the difference between views?
A: User view shows personal dashboard, requests, volunteer hub. City view shows community statistics and worker verification.

Q: How do I access my profile?
A: Click user menu (avatar/name in top right) to see profile options, settings, and logout.

Q: How do I log out?
A: Click user menu (top right), select "Logout" option. This clears session and redirects to home.

Q: What happens after logout?
A: All session data cleared, redirected to home page, must log in again to access dashboard.

Q: How do I change accessibility settings?
A: Click gear icon in navbar, adjust font size, contrast, color filters, motion, text-to-speech, and other accessibility options.

Q: What accessibility features are available?
A: Font size (0.8x-2x), zoom (50%-200%), high contrast, color blindness filters, ADHD mode, sensory-friendly mode, text highlighting, reduce motion, text-to-speech.

Q: How do I enable text-to-speech?
A: Go to accessibility settings (gear icon), enable "Text-to-Speech" toggle. Chat messages and content will be read aloud.

Q: How do I adjust font size?
A: Accessibility settings → Text & Size section → use A- and A+ buttons to decrease/increase font size.

Q: How do I enable high contrast?
A: Accessibility settings → Visual section → toggle "High Contrast Mode" on.

Q: What color blindness filters are available?
A: Protanopia (red-blind), Deuteranopia (green-blind), Tritanopia (blue-blind). Select in accessibility settings.

Q: How do I enable ADHD focus mode?
A: Accessibility settings → Focus & Attention section → toggle "ADHD Focus Mode" on.

Q: What does sensory-friendly mode do?
A: Reduces animations, simplifies visuals, and creates calmer interface for sensory-sensitive users.

Q: How do I reduce motion?
A: Accessibility settings → Motion & Audio section → toggle "Reduce Motion" on to minimize animations.

Q: How do I contact support?
A: Click "Contact Us" button (home page or chatbot), or use contact modal showing email (ronakhjr@gmail.com) and phone (587-971-5138).

Q: How do I copy contact information?
A: In contact modal, click copy button next to email or phone number to copy to clipboard.

Q: What is Binoo the Beacon?
A: The AI chatbot assistant that helps users navigate the app, answer questions, and provide guidance.

Q: How do I use the chatbot?
A: Click "Get Help" button (bottom right, shows Binoo icon) to open chat, type your question, press Enter or click Send.

Q: What can the chatbot help with?
A: Navigation, feature explanations, how to use buttons, create requests, volunteer, access features, troubleshoot issues, and general app guidance.

Q: How do I close the chatbot?
A: Click X button in chat header, click outside chat overlay, or press Escape key.

Q: Can the chatbot perform actions?
A: Chatbot provides guidance and can suggest actions, but you need to click buttons yourself to perform actions.

Q: How do I get help with a specific feature?
A: Ask chatbot "How do I [feature]?" or "Where is [button/feature]?" and it will provide step-by-step guidance.

Q: What if I don't understand something?
A: Ask chatbot for clarification, use "Learn More" button on home page, or contact support for assistance.

Q: How do I report a bug?
A: Use Contact Us to reach support, describe the issue, and include screenshots if possible.

Q: How do I suggest a feature?
A: Contact support via Contact Us button/modal with your feature suggestion.

Q: What if the app isn't working?
A: Check your internet connection, refresh the page, clear browser cache, or contact support for help.

Q: How do I see help documentation?
A: Use "Learn More" button on home page, ask chatbot questions, or check Roadmap for guides.

Q: How do I get started as a new user?
A: Sign up with email and password, log in, explore User Dashboard, create a request or accept one to volunteer.

Q: What should I do first after signing up?
A: Explore the dashboard, check nearby requests, try creating a request, or browse volunteer opportunities.

Q: How do I become an active volunteer?
A: Simply accept help requests! Start with nearby or high-priority requests, complete them successfully to build reputation.

Q: How do I build my volunteer reputation?
A: Accept requests, complete them reliably, help consistently (build streak), and provide good service to earn ratings.

Q: What makes a good volunteer?
A: Being reliable, responsive, completing helps on time, communicating well, and showing empathy and care.

Q: How do I find requests I can help with?
A: Check Nearby Requests on dashboard, browse Help Requests page, or go to Volunteer Hub → Opportunities tab.

Q: How do I know if I'm qualified to help?
A: Check request details for required skills. If you have those skills or can help, you're qualified!

Q: What if I can't complete a help I accepted?
A: Contact the requester if possible, or cancel the acceptance if the system allows. Be communicative about delays.

Q: How do I see my impact?
A: Check Volunteer Hub stats: Total Helps, Hours Volunteered, Rating, and view History tab for all completed helps.

Q: How do I help more people?
A: Check Opportunities tab regularly, accept nearby requests, maintain your streak, and look for high-priority needs.

Q: What is the best way to use the app?
A: Log in regularly, check nearby requests, accept helps you can do, complete them successfully, and explore all features.

Q: How do I stay updated on new requests?
A: Data updates automatically every 10 seconds. Check dashboard regularly or use map view to see new requests appear.

Q: How do I help during emergencies?
A: Look for Urgent priority requests, check map for emergency clusters, respond quickly, and coordinate with other volunteers.

Q: How do I coordinate with other volunteers?
A: Multiple volunteers can accept the same request if it needs multiple people. Check volunteer count on requests.

Q: What if multiple people want to help?
A: Some requests allow multiple volunteers. Check "Volunteers Needed" count and current volunteer count on request.

Q: How do I see who else is helping?
A: Request details may show other volunteers' names if multiple people are helping with the same request.

Q: How do I communicate with requesters?
A: After accepting, a conversation is created. Look for chat/messaging features to communicate with the person you're helping.

Q: What information should I share when helping?
A: Your name, when you can help, what you'll do, and any questions you have about the request.

Q: How do I know what to do for a request?
A: Read the request description carefully, check required skills, and contact requester if you need clarification.

Q: What if I have questions about a request?
A: Contact the requester through the conversation/chat feature, or ask for clarification before accepting.

Q: How do I complete a help successfully?
A: Do what was requested, communicate with requester, mark as complete when done, and optionally provide completion notes.

Q: What happens after I mark a help complete?
A: Request status changes to "Completed", your stats update (total helps, hours), requester can rate you, and it moves to History.

Q: How do I see my completed helps?
A: Go to Volunteer Hub → History tab to see all past helps with dates, hours, and ratings.

Q: How do I improve my rating?
A: Complete helps reliably, be on time, communicate well, show care and empathy, and follow through on commitments.

Q: What is a good volunteer rating?
A: Ratings are out of 5.0. Aim for 4.5+ by being reliable, helpful, and completing requests successfully.

Q: How do I maintain a long streak?
A: Help at least one person every day. Set reminders, check app daily, and accept at least one request per day.

Q: What happens if I miss a day?
A: Your streak resets to 0. Start a new streak by helping someone the next day.

Q: How do I earn achievements?
A: Complete specific milestones: First Help, 10 Helps, 50 Helps, 100 Helps, maintain streaks, help specific categories.

Q: What do achievements do?
A: Show your commitment, build reputation, and demonstrate your impact on the community. They're badges of honor!

Q: How do I see which achievements I'm close to?
A: Go to Volunteer Hub → Achievements tab. Unearned achievements show progress toward earning them.

Q: How do I help specific groups?
A: Filter opportunities by category: Elderly Care, Accessibility, Community, etc. to find requests matching your interests.

Q: How do I help with accessibility needs?
A: Look for Accessibility category requests, or check Roadmap for accessibility resources you can help provide.

Q: How do I help elderly community members?
A: Filter by "Elderly Care" category, accept requests for grocery help, check-ins, medical assistance, or companionship.

Q: How do I help with medical needs?
A: Look for Medical category requests. Be careful - some may need professional care. Help with non-medical aspects when appropriate.

Q: How do I help with community projects?
A: Filter by "Community" category for group projects, cleanups, events, and community-building activities.

Q: How do I help with language support?
A: Look for "Language Support" category requests for translation help, form filling, or communication assistance.

Q: How do I help during disasters?
A: During emergencies, check for Urgent requests, use map to see affected areas, respond quickly, and coordinate with others.

Q: How do I see what help is needed most?
A: Check Urgent and High Priority requests, look at city dashboard statistics, or use map to see request density.

Q: How do I help in my neighborhood?
A: Check "Nearby Requests" on dashboard, use map view centered on your location, or filter by distance.

Q: How do I help people with disabilities?
A: Look for Accessibility category requests, check Roadmap for accessibility resources, and be mindful of specific needs.

Q: How do I help non-English speakers?
A: Look for Language Support requests, use translation features if available, and be patient and clear in communication.

Q: How do I help during heatwaves or extreme weather?
A: Check for weather-related requests, look for water delivery, check-ins, or emergency assistance needs during extreme weather.

Q: How do I help with transportation?
A: Some requests need rides or transportation help. Check request details for transportation needs.

Q: How do I help with shopping or errands?
A: Look for requests needing grocery shopping, errands, or delivery. These are common and easy ways to help.

Q: How do I help with home tasks?
A: Look for requests needing physical labor, home maintenance, yard work, or household tasks.

Q: How do I help with technology?
A: Some requests may need tech help, app assistance, or digital literacy support. Check request descriptions.

Q: How do I help with paperwork or forms?
A: Look for Language Support or General category requests needing help with forms, applications, or documentation.

Q: How do I help with companionship?
A: Look for Elderly Care requests needing check-ins, visits, or social interaction and companionship.

Q: How do I help with emergency situations?
A: Respond to Urgent requests immediately, use map to find nearest emergencies, and coordinate with other volunteers if needed.

Q: How do I help build community?
A: Participate in Community category requests, organize group activities, and encourage neighbors to use the platform.

Q: How do I help spread awareness?
A: Share the app with neighbors, help people sign up, and encourage community members to request or offer help.

Q: How do I help improve the platform?
A: Provide feedback through Contact Us, report bugs, suggest features, and help test new functionality.

Q: How do I help during specific events?
A: Check for event-related requests, look for community gatherings, and see if events need volunteers or support.

Q: How do I help with specific skills I have?
A: Filter requests by skills needed, or browse all requests and look for ones matching your expertise.

Q: How do I help if I have limited time?
A: Look for quick requests (short time needed), nearby requests (less travel), or simple tasks you can do quickly.

Q: How do I help if I have mobility limitations?
A: Look for requests you can help with remotely, online assistance, phone support, or tasks that don't require physical presence.

Q: How do I help if I'm new to volunteering?
A: Start with simple, nearby requests, read descriptions carefully, ask questions, and don't overcommit.

Q: How do I help if I'm experienced?
A: Take on complex requests, help coordinate multiple volunteers, mentor new volunteers, and tackle high-priority needs.

Q: How do I help during holidays?
A: Check for holiday-specific requests, help with meal delivery, check-ins, or special event support.

Q: How do I help during school breaks?
A: Students can help more during breaks. Look for requests needing extra time or multiple volunteers.

Q: How do I help if I work full-time?
A: Look for evening or weekend requests, nearby requests you can do before/after work, or quick tasks during lunch.

Q: How do I help if I'm retired?
A: You have flexible time! Take on longer projects, help during weekdays, and provide consistent support.

Q: How do I help if I have specific expertise?
A: Look for requests needing your professional skills, offer specialized help, and share your knowledge.

Q: How do I help if I'm a student?
A: Help with homework, tutoring, tech support, or tasks that fit around your schedule.

Q: How do I help if I'm a parent?
A: Involve your kids in age-appropriate helps, teach them about community service, and help with family-friendly requests.

Q: How do I help if I'm elderly?
A: Share wisdom, provide companionship, help with phone calls or paperwork, or mentor younger volunteers.

Q: How do I help if I have a disability?
A: Your unique perspective is valuable! Help with accessibility advocacy, peer support, or tasks you can do with accommodations.

Q: How do I help if I don't speak English well?
A: Help with translation, connect with non-English speakers, or assist with language-specific needs.

Q: How do I help if I'm new to the area?
A: Helping is a great way to meet neighbors! Accept nearby requests, join community projects, and build connections.

Q: How do I help if I'm busy?
A: Even small helps matter! Look for quick tasks, nearby requests, or ways to help that fit your schedule.

Q: How do I help if I want to make a big impact?
A: Take on high-priority requests, help coordinate community efforts, mentor others, and tackle systemic needs.

Q: How do I help if I'm shy?
A: Start with tasks requiring less interaction, help online or remotely, or gradually build confidence through helping.

Q: How do I help if I want to learn new skills?
A: Accept requests needing skills you want to learn, ask for guidance, and use helping as a learning opportunity.

Q: How do I help if I want to meet people?
A: Accept requests requiring interaction, join community projects, and use helping as a way to build relationships.

Q: How do I help if I care about specific causes?
A: Filter by category matching your interests: Accessibility, Elderly Care, Community, Medical, etc.

Q: How do I help if I want to build my resume?
A: Document your volunteer work, build skills through helping, and use achievements and stats to showcase experience.

Q: How do I help if I want to give back?
A: Any help is valuable! Start with one request, build from there, and find ways that match your capacity and interests.

Q: How do I help if I'm not sure what to do?
A: Start with simple, nearby requests, read descriptions carefully, ask the chatbot for guidance, and don't hesitate to ask questions.

Q: How do I help if I want to help regularly?
A: Check app daily, maintain a streak, accept multiple requests, and make helping part of your routine.

Q: How do I help if I can only help occasionally?
A: That's fine! Help when you can, accept requests that fit your schedule, and every bit of help matters.

Q: How do I help if I want to help my neighborhood specifically?
A: Use map view centered on your location, check "Nearby Requests", and focus on requests close to you.

Q: How do I help if I want to help city-wide?
A: Don't filter by distance, check all requests, use city dashboard to see city-wide needs, and help wherever needed.

Q: How do I help if I want to help specific groups?
A: Filter by category: Elderly Care for seniors, Accessibility for disabled community, Community for group projects, etc.

Q: How do I help if I want to help during specific times?
A: Check request details for time needed, look for requests you can do during your available hours.

Q: How do I help if I want to help with specific tasks?
A: Read request descriptions, check required skills, and look for requests matching tasks you enjoy or are good at.

Q: How do I help if I want to help but don't know how?
A: Ask the chatbot "How do I help with [type of request]?", read request descriptions, and start with simple tasks.

Q: How do I help if I'm worried about safety?
A: Read request details carefully, communicate with requester first, meet in public if needed, and trust your instincts.

Q: How do I help if I want to help but am concerned about COVID/sickness?
A: Look for requests you can help with remotely, use contactless methods, or help in ways that minimize close contact.

Q: How do I help if I want to help but have limited resources?
A: Many helps don't require money. Offer time, skills, companionship, or simple assistance that doesn't cost anything.

Q: How do I help if I want to help but am not physically strong?
A: Many helps don't require strength: phone calls, paperwork, companionship, tech support, translation, etc.

Q: How do I help if I want to help but don't have a car?
A: Look for nearby requests, help remotely, or assist with tasks that don't require transportation.

Q: How do I help if I want to help but work irregular hours?
A: Look for requests with flexible timing, help on your days off, or find tasks you can do at any time.

Q: How do I help if I want to help but have family commitments?
A: Involve family in helping, find family-friendly requests, or help in ways that work around family time.

Q: How do I help if I want to help but am dealing with my own challenges?
A: Helping others can be therapeutic! Start small, help in ways that don't overwhelm you, and take care of yourself first.

Q: How do I help if I want to help but don't know where to start?
A: Ask chatbot "How do I get started helping?", check Nearby Requests, accept your first request, and build from there!

Remember: Every act of help matters, no matter how small. Start where you are, use what you have, and do what you can!
`

// Get current page context for better responses
function getCurrentPageContext() {
  if (typeof window === 'undefined') return ''
  
  const path = window.location.pathname
  const context = {
    '/': 'Home page - landing page with hero section, learn more, and chatbot',
    '/login': 'Login/Signup page - authentication form',
    '/dashboard/user': 'User Dashboard - main dashboard showing nearby requests, my requests, and quick actions',
    '/dashboard/city': 'City Authorities Dashboard - statistics, recent requests, and worker verification',
    '/dashboard/user/requests': 'Help Requests page - list and map view of all help requests',
    '/dashboard/city/requests': 'Help Requests page - city view of all requests',
    '/dashboard/user/map': 'Map View - interactive map showing requests, businesses, and accessible infrastructure',
    '/dashboard/city/map': 'Map View - city authority view of geographic data',
    '/dashboard/user/roadmap': 'Roadmap - accessibility navigator with businesses, transportation, and guides',
    '/dashboard/city/roadmap': 'Roadmap - city view of accessibility resources',
    '/dashboard/user/volunteer': 'Volunteer Hub - opportunities, active helps, achievements, and history'
  }
  
  return context[path] || `Currently on page: ${path}`
}

// System prompt for the AI assistant
function getSystemPrompt(currentPage = '') {
  return `You are Binoo the Beacon, an expert AI assistant for Burrowly - an AI-Powered Neighborhood Resilience Network.

YOUR ROLE:
- Help users navigate and use the Burrowly application
- Answer questions about features, buttons, navigation, and functionality
- Provide step-by-step guidance for using the app
- Help users understand how to request help, volunteer, and use all features
- Be friendly, helpful, and encouraging
- Use the comprehensive knowledge base to answer accurately

CURRENT CONTEXT:
${currentPage}

COMPREHENSIVE APPLICATION KNOWLEDGE:
${APP_KNOWLEDGE_BASE}

IMPORTANT GUIDELINES:
1. Always provide accurate, specific information based on the knowledge base
2. Give step-by-step instructions when explaining how to do something
3. Mention specific button names, page names, and navigation paths
4. If user asks "how do I...", provide clear step-by-step guidance
5. If user asks "where is...", tell them the exact location (page, section, button)
6. If user asks "what does...", explain clearly and concisely
7. Be encouraging about volunteering and helping others
8. If you don't know something, say so and suggest contacting support
9. Keep responses concise but complete
10. Use the current page context to provide relevant guidance
11. When explaining navigation, mention the exact route/path
12. When explaining buttons, mention their exact location and appearance

RESPONSE STYLE:
- Friendly and approachable
- Clear and specific
- Step-by-step when explaining processes
- Encouraging and supportive
- Concise but complete answers

Remember: You are a master of this application. You know every feature, every button, every navigation path, and every way to use the app. Help users become confident and successful users of Burrowly!`
}

// Chat with AI using Hugging Face Inference API (free, no API key needed for public models)
async function chatWithAI(userMessage, conversationHistory = [], currentPage = '') {
  try {
    // Use Hugging Face Inference API with a free, fast model
    // Using meta-llama/Llama-3.2-3B-Instruct for good quality and speed
    const model = 'meta-llama/Llama-3.2-3B-Instruct'
    
    // Alternative free models if the above doesn't work:
    // 'mistralai/Mistral-7B-Instruct-v0.2'
    // 'google/flan-t5-xxl'
    // 'microsoft/DialoGPT-large'
    
    const systemPrompt = getSystemPrompt(currentPage)
    
    // Format conversation for the model
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Last 10 messages for context
      { role: 'user', content: userMessage }
    ]
    
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: messages.map(m => `${m.role === 'system' ? 'System: ' : m.role === 'user' ? 'User: ' : 'Assistant: '}${m.content}`).join('\n\n') + '\n\nAssistant:',
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false
        }
      })
    })
    
    if (!response.ok) {
      // Fallback to a simpler response if API fails
      throw new Error('API request failed')
    }
    
    const data = await response.json()
    
    // Handle different response formats
    let aiResponse = ''
    if (Array.isArray(data) && data[0]?.generated_text) {
      aiResponse = data[0].generated_text.trim()
    } else if (data.generated_text) {
      aiResponse = data.generated_text.trim()
    } else if (typeof data === 'string') {
      aiResponse = data.trim()
    } else {
      // Fallback response
      aiResponse = generateFallbackResponse(userMessage, currentPage)
    }
    
    // Clean up response (remove any extra formatting)
    aiResponse = aiResponse.split('\n')[0].trim()
    if (!aiResponse || aiResponse.length < 10) {
      aiResponse = generateFallbackResponse(userMessage, currentPage)
    }
    
    return aiResponse
  } catch (error) {
    console.error('AI chat error:', error)
    // Fallback to rule-based responses
    return generateFallbackResponse(userMessage, currentPage)
  }
}

// Fallback response generator using knowledge base
function generateFallbackResponse(userMessage, currentPage) {
  const message = userMessage.toLowerCase()
  
  // Navigation questions
  if (message.includes('how do i') || message.includes('how can i')) {
    if (message.includes('create') && message.includes('request')) {
      return 'To create a help request: 1) Click "Request Help" button on User Dashboard (top right), or "Create Request" on Help Requests page. 2) Fill in the form: Title (min 3 characters), Description (min 10 characters), Category, Priority, Location, and Time Needed. 3) Click Submit. Your request will appear in the system and nearby volunteers will be notified!'
    }
    if (message.includes('accept') || message.includes('volunteer')) {
      return 'To volunteer and accept a request: 1) Go to User Dashboard and see "Nearby Requests", click "Accept" on any request. OR 2) Go to Help Requests page, browse requests, click "Accept" button. OR 3) Go to Volunteer Hub → Opportunities tab, click "Accept Opportunity". After accepting, the request status changes to "Assigned" and you can start helping!'
    }
    if (message.includes('map') || message.includes('view map')) {
      return 'To view the map: Click "View Map" quick action button on User Dashboard, or go to Help Requests page and click the map icon toggle button to switch to Map View. The map shows all requests, accessible businesses, and your location!'
    }
    if (message.includes('roadmap')) {
      return 'To access Roadmap: Click "Roadmap" quick action button on User Dashboard, or use sidebar navigation → Roadmap. Roadmap is an accessibility navigator showing accessible businesses, transportation, support services, and step-by-step guides!'
    }
    if (message.includes('volunteer') || message.includes('volunteer hub')) {
      return 'To access Volunteer Hub: Click "Volunteer" quick action button on User Dashboard, or use sidebar navigation → Volunteer. Here you can see opportunities, your active helps, achievements, and volunteer history!'
    }
    if (message.includes('complete') || message.includes('finish')) {
      return 'To complete a help: Go to Volunteer Hub → My Active Helps tab, find the request you\'re helping with, click "Mark Complete" button. This updates your stats and marks the request as completed!'
    }
    if (message.includes('login') || message.includes('sign in')) {
      return 'To log in: Click "Log In" button in navbar (top right), enter your email and password, click Sign In. After successful login, you\'ll be redirected to your dashboard!'
    }
    if (message.includes('sign up') || message.includes('register')) {
      return 'To sign up: Click "Join Now" button in navbar, or go to /login and click "Sign Up" tab. Fill in your name, email, password (min 6 characters), confirm password, and optional location/role. Click Sign Up to create your account!'
    }
    if (message.includes('delete') && message.includes('request')) {
      return 'To delete your request: Go to Help Requests page, find your request (it will show "isMine" indicator), click Delete button. Confirm deletion. Only the creator can delete their own requests!'
    }
    if (message.includes('filter') || message.includes('search')) {
      return 'To filter requests: On Help Requests page, use the search bar to search text, Category dropdown to filter by type, Priority dropdown for urgency level, and Status dropdown for request status. All filters work together!'
    }
  }
  
  // Location questions
  if (message.includes('where') || message.includes('find')) {
    if (message.includes('dashboard') || message.includes('home')) {
      return 'User Dashboard is at /dashboard/user. After logging in, you\'ll be automatically redirected there. It shows your stats, nearby requests, and quick actions!'
    }
    if (message.includes('request') || message.includes('help request')) {
      return 'Help Requests page is at /dashboard/user/requests. Access it via "Help Requests" quick action button, or sidebar navigation → Help Requests. Here you can see all requests in list or map view!'
    }
    if (message.includes('map')) {
      return 'Map View is at /dashboard/user/map. Access it via "View Map" quick action button, or Help Requests page → map icon toggle. Shows interactive map with all requests and accessible infrastructure!'
    }
    if (message.includes('roadmap')) {
      return 'Roadmap is at /dashboard/user/roadmap. Access it via "Roadmap" quick action button, or sidebar navigation → Roadmap. It\'s an accessibility navigator with businesses, transportation, and guides!'
    }
    if (message.includes('volunteer')) {
      return 'Volunteer Hub is at /dashboard/user/volunteer. Access it via "Volunteer" quick action button, or sidebar navigation → Volunteer. Shows opportunities, active helps, achievements, and history!'
    }
    if (message.includes('button')) {
      return 'Quick action buttons are on User Dashboard: View Map, Roadmap, Volunteer, Help Requests. Navigation buttons are in the sidebar. Action buttons (Accept, Complete, Delete) are on request cards!'
    }
    if (message.includes('create') && message.includes('button')) {
      return 'The "Request Help" button is in the top right of User Dashboard. The "Create Request" button is in the top right of Help Requests page. Both open the request creation form!'
    }
  }
  
  // What/explanation questions
  if (message.includes('what is') || message.includes('what does')) {
    if (message.includes('roadmap')) {
      return 'Roadmap is an Inclusive Access Navigator helping users find accessible businesses, transportation options, support services, and step-by-step guides for accessing help. It has sections for Business Access Info, Transportation, Pathfinder Tools, Deals, and Support Services!'
    }
    if (message.includes('volunteer hub')) {
      return 'Volunteer Hub is where volunteers manage their helping activities. It shows stats (total helps, hours, rating, streak), opportunities to help, active helps you\'re working on, achievements you\'ve earned, and your volunteer history!'
    }
    if (message.includes('dashboard')) {
      return 'User Dashboard is your main hub showing nearby requests, your own requests, quick stats, and quick action buttons to navigate to key features like Map, Roadmap, Volunteer Hub, and Help Requests!'
    }
    if (message.includes('request')) {
      return 'A help request is when someone needs assistance. It includes title, description, category, priority, location, and time needed. Volunteers can accept requests to help, and requesters get notified when someone accepts!'
    }
    if (message.includes('priority')) {
      return 'Request priority indicates urgency: Low (not urgent), Medium (moderate urgency), High (important), Urgent (needs immediate help). Urgent requests appear at the top and are highlighted!'
    }
    if (message.includes('category')) {
      return 'Request categories include: Accessibility, Medical, Community, Safety, Language Support, Elderly Care, and General. Categories help volunteers find requests matching their skills and interests!'
    }
    if (message.includes('achievement')) {
      return 'Achievements are badges you earn for volunteer milestones like First Help, 10 Helps, 50 Helps, Week Streak, Month Streak, Elderly Care Specialist, Accessibility Champion. View them in Volunteer Hub → Achievements tab!'
    }
    if (message.includes('streak')) {
      return 'Day Streak is consecutive days you\'ve helped someone. It shows your consistent community involvement. Maintain it by helping at least one person every day. Missing a day resets it to 0!'
    }
    if (message.includes('rating')) {
      return 'Your volunteer rating (out of 5.0) is your average rating from people you\'ve helped. Higher ratings show you\'re reliable and helpful. Improve it by completing helps successfully and being responsive!'
    }
  }
  
  // Feature questions
  if (message.includes('feature') || message.includes('can i')) {
    return 'Burrowly features include: Creating help requests, Volunteering to help, Interactive map view, Roadmap accessibility guide, Volunteer hub with stats and achievements, City dashboard for authorities, Real-time updates, Search and filters, Accessibility settings, and more! Ask me about any specific feature!'
  }
  
  // Default helpful response
  return `I'm here to help you use Burrowly! I can help you with:
- How to create requests, volunteer, and navigate the app
- Where to find buttons, features, and pages
- Understanding what different features do
- Step-by-step guidance for using the app

What would you like to know? Try asking:
- "How do I create a request?"
- "Where is the map view?"
- "How do I volunteer?"
- "What is the roadmap?"
- Or ask about any feature or button you see!`
}

export { chatWithAI, getCurrentPageContext, getSystemPrompt }

