# Design Document

## Overview

Lockin is a full-stack web application built with NestJS backend, MySQL database, and React frontend, orchestrated via Docker. The system enables users to create and join recurring virtual meeting rooms with Google Meet integration. The architecture follows a modular, layered approach with clear separation between authentication, business logic, data access, and presentation layers.

The system consists of:
- **Backend API**: NestJS REST API with JWT authentication
- **Database**: MySQL with relational schema for users, rooms, and memberships
- **Frontend**: React SPA with calendar visualization
- **Infrastructure**: Docker Compose for local development and deployment

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │  Rooms   │  │Dashboard │  │  Room    │   │
│  │  Pages   │  │  List    │  │ Calendar │  │  Mgmt    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                         │                                    │
│                    HTTP/REST API                            │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    Backend (NestJS)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Layer (Controllers)                  │  │
│  │  AuthController │ RoomController │ MembershipController│ │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Business Logic (Services)                   │  │
│  │  AuthService │ RoomService │ MembershipService │       │  │
│  │              │ ScheduleService                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Data Access Layer (Repositories)              │  │
│  │  UserRepository │ RoomRepository │ MembershipRepository│ │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    MySQL Database                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐          │
│  │  users   │  │  rooms   │  │  room_members    │          │
│  └──────────┘  └──────────┘  └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Module Structure (NestJS)

- **AuthModule**: Handles user registration, login, JWT generation and validation
- **UserModule**: Manages user profile data and queries
- **RoomModule**: Handles room CRUD operations, public listing, and room details
- **MembershipModule**: Manages room membership creation and queries
- **ScheduleModule**: Utility module for computing upcoming meeting events from recurrence patterns

### Technology Stack

**Backend:**
- NestJS (Node.js framework)
- TypeORM (ORM for MySQL)
- Passport + JWT (authentication)
- bcrypt (password hashing)
- class-validator (input validation)

**Frontend:**
- React 18
- React Router (navigation)
- Axios (HTTP client)
- React Big Calendar or FullCalendar (calendar UI)
- Mantine UI or Tailwind CSS (styling)

**Database:**
- MySQL 8.0

**Infrastructure:**
- Docker & Docker Compose
- nginx (optional reverse proxy)

## Components and Interfaces

### Backend Components

#### 1. AuthController
**Endpoints:**
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Authenticate user and return JWT

**Request/Response:**
```typescript
// POST /auth/signup
Request: {
  name: string;
  email: string;
  password: string;
}
Response: {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

// POST /auth/login
Request: {
  email: string;
  password: string;
}
Response: {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
  }
}
```

#### 2. RoomController
**Endpoints:**
- `POST /rooms` - Create room (authenticated)
- `GET /rooms/public` - List all public rooms
- `GET /rooms/:id` - Get room details
- `PATCH /rooms/:id` - Update room (creator only)
- `DELETE /rooms/:id` - Delete room (creator only)

**Request/Response:**
```typescript
// POST /rooms
Request: {
  name: string;
  description: string;
  category: 'study' | 'build' | 'focus' | 'other';
  meet_link: string;
  recurrence_type: 'daily' | 'weekly';
  recurrence_days?: number[]; // [0-6] for weekly, 0=Sunday
  time_of_day: string; // HH:mm format
}
Response: Room

// GET /rooms/public
Response: {
  id: number;
  name: string;
  description: string;
  category: string;
  creator: { id: number; name: string };
  next_meeting: Date | null;
}[]

// GET /rooms/:id
Response: {
  id: number;
  name: string;
  description: string;
  category: string;
  creator: { id: number; name: string };
  meet_link: string;
  recurrence_type: string;
  recurrence_days: number[];
  time_of_day: string;
  next_meeting: Date | null;
  is_member: boolean;
  is_creator: boolean;
}
```

#### 3. MembershipController
**Endpoints:**
- `POST /rooms/:id/join` - Join a room (authenticated)
- `GET /me/rooms` - Get user's joined rooms (authenticated)

**Request/Response:**
```typescript
// POST /rooms/:id/join
Response: {
  id: number;
  user_id: number;
  room_id: number;
  joined_at: Date;
}

// GET /me/rooms
Response: Room[]
```

#### 4. DashboardController
**Endpoints:**
- `GET /me/upcoming-events` - Get upcoming meeting events (authenticated)

**Request/Response:**
```typescript
// GET /me/upcoming-events
Query: {
  days?: number; // default 30
}
Response: {
  room_id: number;
  room_name: string;
  category: string;
  start_time: Date;
  meet_link: string;
}[]
```

### Frontend Components

#### Page Components
1. **LandingPage** - Public homepage with room listing
2. **SignupPage** - User registration form
3. **LoginPage** - User login form
4. **DashboardPage** - Calendar view of upcoming meetings
5. **CreateRoomPage** - Form to create new room
6. **RoomDetailsPage** - Display room information with join button
7. **ManageRoomPage** - Edit room (creator only)

#### Shared Components
1. **RoomCard** - Display room summary
2. **CalendarView** - Render upcoming events in calendar
3. **RecurrenceSelector** - UI for selecting daily/weekly recurrence
4. **ProtectedRoute** - Route wrapper requiring authentication
5. **Navbar** - Navigation with auth state

## Data Models

### Database Schema

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

CREATE TABLE rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM('study', 'build', 'focus', 'other') NOT NULL,
  creator_id INT NOT NULL,
  meet_link VARCHAR(255) NOT NULL,
  recurrence_type ENUM('daily', 'weekly') NOT NULL,
  recurrence_days JSON, -- array of weekday numbers [0-6]
  time_of_day TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_creator (creator_id),
  INDEX idx_category (category)
);

CREATE TABLE room_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  room_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  UNIQUE KEY unique_membership (user_id, room_id),
  INDEX idx_user (user_id),
  INDEX idx_room (room_id)
);
```

### TypeORM Entities

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Room, room => room.creator)
  created_rooms: Room[];

  @OneToMany(() => RoomMember, member => member.user)
  memberships: RoomMember[];
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: ['study', 'build', 'focus', 'other'] })
  category: string;

  @Column()
  creator_id: number;

  @ManyToOne(() => User, user => user.created_rooms)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column()
  meet_link: string;

  @Column({ type: 'enum', enum: ['daily', 'weekly'] })
  recurrence_type: string;

  @Column('json', { nullable: true })
  recurrence_days: number[];

  @Column('time')
  time_of_day: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => RoomMember, member => member.room)
  members: RoomMember[];
}

@Entity('room_members')
export class RoomMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  room_id: number;

  @ManyToOne(() => User, user => user.memberships)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Room, room => room.members)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @CreateDateColumn()
  joined_at: Date;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: User registration creates complete account
*For any* valid email and password, registering a new user should create an account with all required fields (name, email, hashed password, timestamp) persisted to the database, and the password should be hashed (not stored in plaintext).
**Validates: Requirements 1.1, 1.3**

### Property 2: Invalid email formats are rejected
*For any* string that does not match valid email format, attempting to register should be rejected with a validation error.
**Validates: Requirements 1.4**

### Property 3: Successful login returns valid JWT with user ID
*For any* registered user, logging in with correct credentials should return a JWT token that contains the user's identifier in its payload.
**Validates: Requirements 2.1, 2.4**

### Property 4: Protected endpoints require valid JWT
*For any* protected endpoint, attempting to access it without a valid JWT token should result in rejection with an authentication error.
**Validates: Requirements 2.5**

### Property 5: Room creation persists all details with creator assignment
*For any* valid room data (name, description, category, recurrence, time, meet link), creating a room should persist all fields to the database and assign the creating user as the creator.
**Validates: Requirements 3.1, 3.2**

### Property 6: Weekly recurrence stores selected weekdays
*For any* set of selected weekdays (0-6), creating a room with weekly recurrence should store those exact weekdays in the recurrence_days field.
**Validates: Requirements 3.4**

### Property 7: Missing required fields are rejected
*For any* room creation request with missing required fields (name, category, meet_link, recurrence_type, or time_of_day), the system should reject the request with validation errors.
**Validates: Requirements 3.5**

### Property 8: Public rooms response includes all required fields
*For any* public room, the rooms listing should include name, description, category, creator information, and computed next meeting time.
**Validates: Requirements 4.1**

### Property 9: Next meeting time is correctly computed
*For any* room with a recurrence pattern, the computed next meeting time should be the earliest future occurrence that matches the recurrence rules (daily or specific weekdays) and time of day.
**Validates: Requirements 4.2**

### Property 10: Rooms are ordered by next meeting time
*For any* set of public rooms, the listing should be ordered by next meeting time in ascending chronological order.
**Validates: Requirements 4.4**

### Property 11: Joining creates membership record
*For any* user and room, when the user joins the room, a membership record should be created with user ID, room ID, and join timestamp.
**Validates: Requirements 5.1**

### Property 12: Joining is idempotent
*For any* user and room, joining the same room multiple times should result in only one membership record (no duplicates).
**Validates: Requirements 5.2**

### Property 13: Members can access meet links
*For any* room that a user has joined, that user should be able to retrieve the Google Meet link for that room.
**Validates: Requirements 5.3**

### Property 14: Joined rooms appear in dashboard
*For any* room that a user has joined or created, that room should appear in the user's dashboard with upcoming meeting events.
**Validates: Requirements 5.4**

### Property 15: Room updates persist changes
*For any* room field (name, description, category, recurrence, time, meet_link), when the creator updates that field, the new value should be persisted and reflected in subsequent queries.
**Validates: Requirements 6.1**

### Property 16: Room deletion cascades to memberships
*For any* room with members, when the creator deletes the room, both the room record and all associated membership records should be removed from the database.
**Validates: Requirements 6.2**

### Property 17: Non-creators cannot modify rooms
*For any* room and any user who is not the creator, attempting to update or delete that room should be rejected with an authorization error.
**Validates: Requirements 6.3, 6.4**

### Property 18: Dashboard shows all user rooms with complete event data
*For any* user, the dashboard should compute and display upcoming meeting events for all rooms the user created or joined, with each event containing room name, start time, and Google Meet link.
**Validates: Requirements 7.1, 7.3**

### Property 19: Schedule generator produces 30-day events
*For any* room with a recurrence pattern, the schedule generator should produce all meeting occurrences within the next 30 days based on the recurrence rules.
**Validates: Requirements 7.2**

### Property 20: Events are chronologically ordered
*For any* set of meeting events, they should be displayed in chronological order by start time.
**Validates: Requirements 7.5**

### Property 21: Room details include complete information
*For any* room, the details page should display all room information including name, full description, category, creator name, recurrence pattern, meeting time, and next scheduled meeting time.
**Validates: Requirements 8.1, 8.2**

### Property 22: Non-members cannot access meet links
*For any* room that a user has not joined, attempting to access the Google Meet link should require the user to join the room first.
**Validates: Requirements 9.2**

### Property 23: Data changes persist immediately
*For any* create or update operation on users, rooms, or memberships, the changes should be immediately visible in subsequent database queries.
**Validates: Requirements 10.1, 10.2, 10.3**

### Property 24: Foreign key constraints prevent orphaned records
*For any* attempt to create a room with non-existent creator_id or membership with non-existent user_id or room_id, the database should reject the operation and enforce referential integrity.
**Validates: Requirements 10.5**

## Error Handling

### Error Categories

1. **Validation Errors (400 Bad Request)**
   - Invalid email format
   - Password too short
   - Missing required fields
   - Invalid enum values (category, recurrence_type)

2. **Authentication Errors (401 Unauthorized)**
   - Invalid credentials
   - Missing JWT token
   - Expired JWT token
   - Invalid JWT signature

3. **Authorization Errors (403 Forbidden)**
   - Non-creator attempting to modify room
   - Non-member attempting to access meet link

4. **Not Found Errors (404 Not Found)**
   - Room does not exist
   - User does not exist

5. **Conflict Errors (409 Conflict)**
   - Email already registered

6. **Server Errors (500 Internal Server Error)**
   - Database connection failures
   - Unexpected exceptions

### Error Response Format

All errors should follow a consistent format:

```typescript
{
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
```

### Error Handling Strategy

- Use NestJS built-in exception filters
- Implement global exception filter for unhandled errors
- Log all errors with appropriate severity levels
- Never expose sensitive information (stack traces, database details) in production
- Validate all inputs using class-validator decorators
- Use TypeORM transaction rollback for data consistency

## Testing Strategy

### Unit Testing

The system will use **Jest** (built into NestJS) for unit testing. Unit tests will cover:

**Backend Unit Tests:**
- Service layer business logic (AuthService, RoomService, MembershipService, ScheduleService)
- Controller input validation and response formatting
- Utility functions (password hashing, JWT generation)
- Specific edge cases:
  - Empty room list (Requirement 4.3)
  - Empty dashboard (Requirement 7.4)
  - Duplicate email registration (Requirement 1.2)
  - Invalid credentials (Requirements 2.2, 2.3)
  - Password length boundary (Requirement 1.5)
  - Daily recurrence storage (Requirement 3.3)

**Frontend Unit Tests:**
- Component rendering with different props
- Form validation logic
- Date/time formatting utilities
- API client error handling

### Property-Based Testing

The system will use **fast-check** (JavaScript/TypeScript property-based testing library) for property-based testing.

**Configuration:**
- Each property test MUST run a minimum of 100 iterations
- Each property test MUST be tagged with a comment referencing the design document property
- Tag format: `// Feature: lockin-platform, Property {number}: {property_text}`

**Property Tests to Implement:**

Each of the 24 correctness properties listed above will be implemented as a property-based test. The tests will:

1. Generate random valid inputs using fast-check arbitraries
2. Execute the system operation
3. Assert the property holds true
4. Let fast-check automatically find counterexamples if the property fails

**Example Property Test Structure:**

```typescript
// Feature: lockin-platform, Property 1: User registration creates complete account
it('should create complete user account with hashed password', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.emailAddress(),
      fc.string({ minLength: 8, maxLength: 50 }),
      fc.string({ minLength: 2, maxLength: 100 }),
      async (email, password, name) => {
        const user = await authService.register({ email, password, name });
        
        expect(user.email).toBe(email);
        expect(user.name).toBe(name);
        expect(user.password_hash).toBeDefined();
        expect(user.password_hash).not.toBe(password); // hashed, not plaintext
        expect(user.created_at).toBeInstanceOf(Date);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

Integration tests will verify:
- End-to-end API flows (signup → create room → join room → view dashboard)
- Database transactions and rollbacks
- JWT authentication flow across multiple requests
- Cascade deletion behavior

### Test Database

- Use separate MySQL test database
- Reset database state between test suites
- Use TypeORM migrations for schema consistency
- Seed test data for integration tests

## Security Considerations

1. **Password Security**
   - Use bcrypt with salt rounds ≥ 10
   - Never log or expose passwords
   - Enforce minimum password length (8 characters)

2. **JWT Security**
   - Use strong secret key (environment variable)
   - Set reasonable expiration (24 hours for MVP)
   - Include only necessary claims (user ID, email)
   - Validate signature on every protected request

3. **Input Validation**
   - Validate all inputs using class-validator
   - Sanitize user-generated content (room names, descriptions)
   - Prevent SQL injection via TypeORM parameterized queries
   - Validate URL format for Google Meet links

4. **Authorization**
   - Verify room creator before allowing updates/deletes
   - Check membership before exposing meet links
   - Use NestJS guards for route protection

5. **CORS Configuration**
   - Configure allowed origins for production
   - Restrict to frontend domain only

## Deployment Architecture (Docker)

### Docker Compose Structure

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_HOST=db
      - DATABASE_PORT=3306
      - DATABASE_USER=lockin
      - DATABASE_PASSWORD=lockin_password
      - DATABASE_NAME=lockin_db
      - JWT_SECRET=your_jwt_secret_here
    depends_on:
      - db
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=lockin_db
      - MYSQL_USER=lockin
      - MYSQL_PASSWORD=lockin_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### Environment Variables

**Backend (.env):**
```
DATABASE_HOST=db
DATABASE_PORT=3306
DATABASE_USER=lockin
DATABASE_PASSWORD=lockin_password
DATABASE_NAME=lockin_db
JWT_SECRET=your_secure_jwt_secret_change_in_production
JWT_EXPIRATION=24h
PORT=3000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3000
```

## Performance Considerations

1. **Database Indexing**
   - Index on users.email for login queries
   - Index on rooms.creator_id for user's rooms queries
   - Index on room_members.user_id for membership lookups
   - Composite index on (user_id, room_id) for join operations

2. **Query Optimization**
   - Use TypeORM eager loading for creator relations
   - Limit public rooms query results (pagination for future)
   - Cache JWT validation results per request

3. **Schedule Generation**
   - Compute next 30 days only (not entire future)
   - Cache computed schedules with TTL
   - Generate schedules on-demand, not pre-computed

4. **API Response Times**
   - Target < 300ms for all endpoints
   - Use connection pooling for database
   - Minimize N+1 queries with proper joins

## Future Extensibility

The design supports future enhancements:

1. **Google Calendar Integration**
   - Add OAuth flow in AuthModule
   - Create CalendarService to sync events
   - Store refresh tokens in users table

2. **Email Notifications**
   - Add EmailModule with template engine
   - Create notification queue (Bull/Redis)
   - Add user notification preferences

3. **Private Rooms**
   - Add visibility field to rooms table
   - Implement invitation system
   - Add room_invitations table

4. **Real-time Updates**
   - Add WebSocket gateway (Socket.io)
   - Broadcast room updates to members
   - Live calendar updates

5. **Advanced Scheduling**
   - Support custom recurrence patterns
   - Add timezone support
   - Handle daylight saving time transitions
