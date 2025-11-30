# Implementation Plan

- [x] 1. Set up project infrastructure and Docker configuration
  - Create root directory structure with backend, frontend, and docker-compose.yml
  - Configure Docker Compose with MySQL, NestJS backend, and React frontend services
  - Set up environment variable files for backend and frontend
  - Create Dockerfiles for backend and frontend with appropriate base images
  - Configure volume mounts and service dependencies
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 2. Initialize NestJS backend project
  - Generate NestJS application with CLI
  - Install required dependencies (TypeORM, MySQL driver, Passport, JWT, bcrypt, class-validator)
  - Configure TypeORM connection with MySQL database settings
  - Set up environment configuration module for reading .env files
  - Create basic app structure with health check endpoint
  - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [x] 3. Create database schema and entities
  - Define User entity with TypeORM decorators (id, name, email, password_hash, created_at)
  - Define Room entity with relationships to User (id, name, description, category, creator_id, meet_link, recurrence_type, recurrence_days, time_of_day, created_at)
  - Define RoomMember entity with relationships to User and Room (id, user_id, room_id, joined_at)
  - Add database indexes on email, creator_id, user_id, room_id
  - Create TypeORM migration for initial schema
  - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [x]* 3.1 Write property test for foreign key constraints
  - **Property 24: Foreign key constraints prevent orphaned records**
  - **Validates: Requirements 10.5**

- [x] 4. Implement authentication module
- [x] 4.1 Create AuthModule with AuthService and AuthController
  - Implement password hashing utility using bcrypt
  - Implement JWT generation and validation utilities
  - Create DTOs for signup and login requests with validation decorators
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 2.1, 2.4_

- [x] 4.2 Implement user registration endpoint (POST /auth/signup)
  - Validate email format and password length
  - Check for duplicate email addresses
  - Hash password and create user record
  - Return user data (excluding password hash)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x]* 4.3 Write property test for user registration
  - **Property 1: User registration creates complete account**
  - **Validates: Requirements 1.1, 1.3**

- [x]* 4.4 Write property test for email validation
  - **Property 2: Invalid email formats are rejected**
  - **Validates: Requirements 1.4**

- [x] 4.5 Implement user login endpoint (POST /auth/login)
  - Validate credentials against database
  - Generate JWT token with user ID in payload
  - Return token and user data
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x]* 4.6 Write property test for login JWT generation
  - **Property 3: Successful login returns valid JWT with user ID**
  - **Validates: Requirements 2.1, 2.4**

- [x] 4.7 Create JWT authentication guard
  - Implement Passport JWT strategy
  - Create guard decorator for protecting routes
  - Extract user from JWT payload and attach to request
  - _Requirements: 2.5_

- [x]* 4.8 Write property test for protected endpoint authentication
  - **Property 4: Protected endpoints require valid JWT**
  - **Validates: Requirements 2.5**

- [x]* 4.9 Write unit tests for authentication edge cases
  - Test duplicate email registration (Requirement 1.2)
  - Test incorrect password login (Requirement 2.2)
  - Test non-existent user login (Requirement 2.3)
  - Test password length boundary (Requirement 1.5)

- [x] 5. Implement schedule generation utility
- [x] 5.1 Create ScheduleService with recurrence computation logic
  - Implement function to compute next meeting time from recurrence pattern
  - Implement function to generate all occurrences within date range (30 days)
  - Handle daily recurrence pattern
  - Handle weekly recurrence pattern with specific weekdays
  - Account for current date/time when computing next occurrence
  - _Requirements: 4.2, 7.2_

- [x]* 5.2 Write property test for next meeting computation
  - **Property 9: Next meeting time is correctly computed**
  - **Validates: Requirements 4.2**

- [x]* 5.3 Write property test for 30-day schedule generation
  - **Property 19: Schedule generator produces 30-day events**
  - **Validates: Requirements 7.2**

- [x]* 5.4 Write unit tests for schedule edge cases
  - Test daily recurrence computation
  - Test weekly recurrence with multiple weekdays
  - Test edge case where current time is past today's meeting time

- [x] 6. Implement room management module
- [x] 6.1 Create RoomModule with RoomService and RoomController
  - Set up module with TypeORM repository injection
  - Create DTOs for room creation and updates with validation
  - Define room category enum
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6.2 Implement room creation endpoint (POST /rooms)
  - Validate all required fields (name, category, meet_link, recurrence_type, time_of_day)
  - Validate recurrence_days for weekly recurrence
  - Assign authenticated user as creator
  - Save room to database
  - Return created room with creator information
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x]* 6.3 Write property test for room creation
  - **Property 5: Room creation persists all details with creator assignment**
  - **Validates: Requirements 3.1, 3.2**

- [x]* 6.4 Write property test for weekly recurrence storage
  - **Property 6: Weekly recurrence stores selected weekdays**
  - **Validates: Requirements 3.4**

- [x]* 6.5 Write property test for room validation
  - **Property 7: Missing required fields are rejected**
  - **Validates: Requirements 3.5**

- [x]* 6.6 Write unit test for daily recurrence
  - Test daily recurrence room creation (Requirement 3.3)

- [x] 6.3 Implement public rooms listing endpoint (GET /rooms/public)
  - Query all rooms with creator information
  - Compute next meeting time for each room using ScheduleService
  - Order rooms by next meeting time ascending
  - Return room list with required fields
  - _Requirements: 4.1, 4.2, 4.4_

- [x]* 6.4 Write property test for public rooms response
  - **Property 8: Public rooms response includes all required fields**
  - **Validates: Requirements 4.1**

- [x]* 6.5 Write property test for room ordering
  - **Property 10: Rooms are ordered by next meeting time**
  - **Validates: Requirements 4.4**

- [x]* 6.6 Write unit test for empty rooms list
  - Test empty state when no rooms exist (Requirement 4.3)

- [x] 6.7 Implement room details endpoint (GET /rooms/:id)
  - Query room by ID with creator information
  - Compute next meeting time
  - Check if requesting user is member or creator
  - Return complete room details with membership status
  - _Requirements: 8.1, 8.2_

- [x]* 6.8 Write property test for room details completeness
  - **Property 21: Room details include complete information**
  - **Validates: Requirements 8.1, 8.2**

- [x] 6.9 Implement room update endpoint (PATCH /rooms/:id)
  - Verify requesting user is the room creator
  - Validate updated fields
  - Update room record with new values
  - Return updated room
  - _Requirements: 6.1, 6.3_

- [x]* 6.10 Write property test for room updates
  - **Property 15: Room updates persist changes**
  - **Validates: Requirements 6.1**

- [x]* 6.11 Write property test for non-creator authorization
  - **Property 17: Non-creators cannot modify rooms**
  - **Validates: Requirements 6.3, 6.4**

- [x] 6.12 Implement room deletion endpoint (DELETE /rooms/:id)
  - Verify requesting user is the room creator
  - Delete room (cascade to memberships via foreign key)
  - Return success response
  - _Requirements: 6.2, 6.4_

- [x]* 6.13 Write property test for cascade deletion
  - **Property 16: Room deletion cascades to memberships**
  - **Validates: Requirements 6.2**

- [x] 7. Implement membership module
- [x] 7.1 Create MembershipModule with MembershipService and MembershipController
  - Set up module with TypeORM repository injection
  - Create DTOs for membership operations
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7.2 Implement join room endpoint (POST /rooms/:id/join)
  - Verify room exists
  - Create membership record with user and room IDs
  - Handle duplicate joins (idempotent operation)
  - Return membership record
  - _Requirements: 5.1, 5.2_

- [x]* 7.3 Write property test for membership creation
  - **Property 11: Joining creates membership record**
  - **Validates: Requirements 5.1**

- [x]* 7.4 Write property test for join idempotency
  - **Property 12: Joining is idempotent**
  - **Validates: Requirements 5.2**

- [x] 7.5 Implement user rooms endpoint (GET /me/rooms)
  - Query all rooms where user is creator or member
  - Include room details and creator information
  - Return list of user's rooms
  - _Requirements: 5.4_

- [x]* 7.6 Write property test for member access to meet links
  - **Property 13: Members can access meet links**
  - **Validates: Requirements 5.3**

- [x]* 7.7 Write property test for non-member access restriction
  - **Property 22: Non-members cannot access meet links**
  - **Validates: Requirements 9.2**

- [x] 8. Implement dashboard endpoints
- [x] 8.1 Create DashboardController with upcoming events endpoint
  - Implement GET /me/upcoming-events endpoint
  - Query all rooms where user is creator or member
  - Generate upcoming events for next 30 days using ScheduleService
  - Include room name, start time, and meet link for each event
  - Sort events chronologically
  - Return events array
  - _Requirements: 7.1, 7.3, 7.5_

- [x]* 8.2 Write property test for dashboard completeness
  - **Property 18: Dashboard shows all user rooms with complete event data**
  - **Validates: Requirements 7.1, 7.3**

- [x]* 8.3 Write property test for event ordering
  - **Property 20: Events are chronologically ordered**
  - **Validates: Requirements 7.5**

- [x]* 8.4 Write unit test for empty dashboard
  - Test empty state when user has no memberships (Requirement 7.4)

- [x] 9. Implement global error handling and validation
  - Create global exception filter for consistent error responses
  - Configure validation pipe for automatic DTO validation
  - Add error logging with appropriate severity levels
  - Ensure error responses follow standard format (statusCode, message, error, timestamp, path)
  - _Requirements: 1.2, 1.4, 1.5, 2.2, 2.3, 2.5, 3.5, 6.3, 6.4_

- [x]* 9.1 Write property test for data persistence
  - **Property 23: Data changes persist immediately**
  - **Validates: Requirements 10.1, 10.2, 10.3**

- [x] 10. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Initialize React frontend project
  - Create React application with Vite
  - Install dependencies (React Router, Axios, Mantine UI or Tailwind, React Big Calendar)
  - Configure API client with base URL from environment
  - Set up routing structure
  - Create authentication context for managing JWT token
  - _Requirements: All frontend requirements_

- [x] 12. Implement authentication pages
- [x] 12.1 Create signup page with form
  - Build form with name, email, and password fields
  - Add client-side validation (email format, password length)
  - Call POST /auth/signup API endpoint
  - Handle success (redirect to login) and error states
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 12.2 Create login page with form
  - Build form with email and password fields
  - Call POST /auth/login API endpoint
  - Store JWT token in localStorage or context
  - Handle success (redirect to dashboard) and error states
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 12.3 Implement authentication context and protected routes
  - Create context to manage authentication state and token
  - Implement ProtectedRoute component that checks authentication
  - Add token to Axios requests via interceptor
  - Handle token expiration and redirect to login
  - _Requirements: 2.5_

- [x] 13. Implement room listing and discovery
- [x] 13.1 Create landing page with public rooms
  - Fetch rooms from GET /rooms/public endpoint
  - Display room cards with name, description, category, next meeting time
  - Add "View Details" and "Join Room" buttons
  - Handle empty state when no rooms exist
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 13.2 Create RoomCard component
  - Display room summary information
  - Format next meeting time in readable format
  - Add category badge/tag
  - Make card clickable to navigate to details
  - _Requirements: 4.1_

- [x] 14. Implement room details page
- [x] 14.1 Create room details page
  - Fetch room details from GET /rooms/:id endpoint
  - Display complete room information (name, description, category, creator, schedule)
  - Show next meeting time
  - Conditionally render "Join Room" button for non-members
  - Conditionally render "Manage Room" button for creators
  - Handle join room action (POST /rooms/:id/join)
  - _Requirements: 8.1, 8.2, 9.1_

- [x] 15. Implement room creation and management
- [x] 15.1 Create room creation page with form
  - Build form with fields: name, description, category dropdown, meet link, recurrence type, weekday selector, time picker
  - Add client-side validation for required fields
  - Call POST /rooms endpoint
  - Handle success (redirect to room details) and error states
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 15.2 Create RecurrenceSelector component
  - Build UI for selecting daily or weekly recurrence
  - For weekly, show checkboxes for each day of week
  - Add time picker for meeting time
  - _Requirements: 3.3, 3.4_

- [x] 15.3 Create room management page for editing
  - Reuse room creation form with pre-filled values
  - Call PATCH /rooms/:id endpoint
  - Add delete button with confirmation dialog
  - Call DELETE /rooms/:id endpoint for deletion
  - Handle authorization errors (non-creators)
  - Redirect after successful update or deletion
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 16. Implement dashboard with calendar
- [x] 16.1 Create dashboard page with calendar view
  - Fetch upcoming events from GET /me/upcoming-events endpoint
  - Integrate React Big Calendar or FullCalendar component
  - Display events on calendar with room names and times
  - Make events clickable to open Google Meet link in new tab
  - Handle empty state when user has no rooms
  - Add link to create new room
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 9.1_

- [x] 16.2 Create event formatting utilities
  - Format dates and times for calendar display
  - Convert API event data to calendar event format
  - Handle timezone display (use browser local time)
  - _Requirements: 7.3, 7.5_

- [x] 17. Implement navigation and layout
- [x] 17.1 Create Navbar component
  - Show app logo/name
  - Display navigation links (Home, Dashboard, Create Room)
  - Show user name and logout button when authenticated
  - Show login/signup links when not authenticated
  - Handle logout (clear token and redirect)
  - _Requirements: All navigation requirements_

- [x] 17.2 Create layout wrapper component
  - Include Navbar in all pages
  - Add consistent padding and styling
  - Implement responsive design for mobile
  - _Requirements: All UI requirements_

- [x] 18. Add styling and polish
  - Apply consistent color scheme (white + soft sky blue accents)
  - Style forms with clear labels and validation feedback
  - Add loading states for API calls
  - Add error message displays
  - Ensure responsive design works on mobile and desktop
  - Add hover effects and transitions for better UX
  - _Requirements: All UI requirements_

- [x] 19. Final integration and testing
- [x] 19.1 Test complete user flows
  - Test signup → login → create room → view on homepage flow
  - Test join room → view in dashboard → access meet link flow
  - Test room management (edit and delete) flow
  - Test authorization (non-creator cannot edit)
  - Verify all error states display correctly
  - _Requirements: All requirements_

- [x] 19.2 Verify Docker setup
  - Test docker-compose up starts all services
  - Verify backend connects to MySQL
  - Verify frontend connects to backend API
  - Test database persistence across container restarts
  - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [x] 20. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
