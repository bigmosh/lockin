# Requirements Document

## Introduction

Lockin is a virtual coworking platform that enables users to create, discover, and join recurring Google Meet study/build/focus rooms. The system provides authentication, room management, membership tracking, and a calendar dashboard for upcoming meetings. The platform is designed for learners, builders, and focus seekers who want consistent accountability partners and structured coworking sessions.

## Glossary

- **User**: An authenticated individual who can create or join rooms
- **Room**: A virtual meeting space with recurring schedule and Google Meet link
- **Creator**: The User who owns and manages a specific Room
- **Member**: A User who has joined a Room
- **Recurrence**: The repeating schedule pattern (daily or weekly) for Room meetings
- **Meeting Event**: A specific occurrence of a Room meeting at a scheduled time
- **Dashboard**: The User interface displaying upcoming Meeting Events
- **Authentication System**: The component managing User identity and access control
- **Room Management System**: The component handling Room creation, updates, and deletion
- **Membership System**: The component tracking User participation in Rooms
- **Schedule Generator**: The component computing upcoming Meeting Events from Recurrence patterns

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to create an account with email and password, so that I can access the platform and create or join rooms.

#### Acceptance Criteria

1. WHEN a User submits registration with valid email and password THEN the Authentication System SHALL create a new User account with hashed password
2. WHEN a User submits registration with an already registered email THEN the Authentication System SHALL reject the registration and return an error message
3. WHEN a User account is created THEN the Authentication System SHALL store the User name, email, hashed password, and creation timestamp
4. WHEN a User submits registration with invalid email format THEN the Authentication System SHALL reject the registration and return a validation error
5. WHEN a User submits registration with password shorter than 8 characters THEN the Authentication System SHALL reject the registration and return a validation error

### Requirement 2: User Authentication

**User Story:** As a registered user, I want to log in with my credentials, so that I can access my rooms and dashboard.

#### Acceptance Criteria

1. WHEN a User submits valid email and password THEN the Authentication System SHALL generate a JWT token and grant access
2. WHEN a User submits incorrect password THEN the Authentication System SHALL reject the login and return an authentication error
3. WHEN a User submits email that does not exist THEN the Authentication System SHALL reject the login and return an authentication error
4. WHEN a JWT token is generated THEN the Authentication System SHALL include the User identifier in the token payload
5. WHEN a User accesses protected endpoints THEN the Authentication System SHALL validate the JWT token before granting access

### Requirement 3: Room Creation

**User Story:** As an authenticated user, I want to create a recurring meeting room with schedule and Google Meet link, so that others can join my study/build/focus sessions.

#### Acceptance Criteria

1. WHEN a User creates a Room with valid details THEN the Room Management System SHALL store the Room with name, description, category, recurrence pattern, time, and Google Meet link
2. WHEN a Room is created THEN the Room Management System SHALL assign the creating User as the Creator
3. WHEN a User creates a Room with daily recurrence THEN the Room Management System SHALL store recurrence type as daily with specified time
4. WHEN a User creates a Room with weekly recurrence THEN the Room Management System SHALL store recurrence type as weekly with selected weekdays and specified time
5. WHEN a User creates a Room without required fields THEN the Room Management System SHALL reject the creation and return validation errors

### Requirement 4: Room Discovery

**User Story:** As a user, I want to browse available public rooms on the homepage, so that I can find rooms matching my interests.

#### Acceptance Criteria

1. WHEN a User views the public rooms page THEN the Room Management System SHALL display all public Rooms with name, description, category, and next meeting time
2. WHEN displaying a Room THEN the Room Management System SHALL compute the next scheduled Meeting Event based on current time and Recurrence pattern
3. WHEN no public Rooms exist THEN the Room Management System SHALL display an empty state message
4. WHEN Rooms are listed THEN the Room Management System SHALL order them by next meeting time in ascending order

### Requirement 5: Room Membership

**User Story:** As an authenticated user, I want to join a room, so that I can participate in meetings and see them in my dashboard.

#### Acceptance Criteria

1. WHEN a User joins a Room THEN the Membership System SHALL create a membership record with User identifier, Room identifier, and join timestamp
2. WHEN a User joins a Room they already joined THEN the Membership System SHALL maintain the existing membership without duplication
3. WHEN a User joins a Room THEN the Membership System SHALL grant access to the Google Meet link
4. WHEN a User is a Member of a Room THEN the Membership System SHALL include that Room in the User dashboard

### Requirement 6: Room Management

**User Story:** As a room creator, I want to edit or delete my rooms, so that I can update schedules or remove rooms I no longer need.

#### Acceptance Criteria

1. WHEN a Creator updates their Room details THEN the Room Management System SHALL save the updated name, description, category, recurrence, time, or Google Meet link
2. WHEN a Creator deletes their Room THEN the Room Management System SHALL remove the Room and all associated memberships
3. WHEN a non-Creator User attempts to update a Room THEN the Room Management System SHALL reject the request and return an authorization error
4. WHEN a non-Creator User attempts to delete a Room THEN the Room Management System SHALL reject the request and return an authorization error
5. WHEN a Creator views their Room THEN the Room Management System SHALL display management options for editing and deletion

### Requirement 7: Dashboard Calendar

**User Story:** As an authenticated user, I want to view upcoming meetings in a calendar, so that I can see when my joined rooms are scheduled.

#### Acceptance Criteria

1. WHEN a User views their Dashboard THEN the Schedule Generator SHALL compute upcoming Meeting Events for all Rooms the User created or joined
2. WHEN computing upcoming events THEN the Schedule Generator SHALL generate events for the next 30 days based on each Room Recurrence pattern
3. WHEN displaying a Meeting Event THEN the Dashboard SHALL show Room name, start time, and Google Meet link
4. WHEN a User has no Room memberships THEN the Dashboard SHALL display an empty state message
5. WHEN Meeting Events are displayed THEN the Dashboard SHALL render them in chronological order within a calendar view

### Requirement 8: Room Details

**User Story:** As a user, I want to view detailed information about a room, so that I can decide whether to join it.

#### Acceptance Criteria

1. WHEN a User views a Room details page THEN the Room Management System SHALL display the Room name, full description, category, Creator name, recurrence pattern, and meeting time
2. WHEN a User views a Room details page THEN the Room Management System SHALL display the next scheduled Meeting Event time
3. WHEN a User views a Room they have not joined THEN the Room Management System SHALL display a join button
4. WHEN a User views a Room they created THEN the Room Management System SHALL display management options instead of a join button

### Requirement 9: Meeting Access

**User Story:** As a room member, I want to access the Google Meet link, so that I can join the virtual meeting.

#### Acceptance Criteria

1. WHEN a Member clicks join meeting THEN the Room Management System SHALL provide the Google Meet link for that Room
2. WHEN a non-Member attempts to access a Meeting Event THEN the Room Management System SHALL require the User to join the Room first
3. WHEN a Google Meet link is displayed THEN the Room Management System SHALL render it as a clickable link that opens in a new browser tab

### Requirement 10: Data Persistence

**User Story:** As a system administrator, I want all data stored reliably in a database, so that user information and rooms persist across sessions.

#### Acceptance Criteria

1. WHEN any User data is created or modified THEN the Authentication System SHALL persist changes to the users table immediately
2. WHEN any Room data is created or modified THEN the Room Management System SHALL persist changes to the rooms table immediately
3. WHEN any membership is created THEN the Membership System SHALL persist the record to the room_members table immediately
4. WHEN the system queries data THEN the database SHALL use indexes on creator_id, category, and recurrence_days for performance
5. WHEN the system starts THEN the database SHALL enforce foreign key constraints between users, rooms, and room_members tables
