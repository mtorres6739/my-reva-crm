# REVA CRM Project Notes

## Project Overview
A full-stack CRM application built with modern web technologies, featuring task management, activity tracking, and user authentication.

## Tech Stack
- **Frontend**: React.js with Vite
- **Backend**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT-based authentication
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Package Manager**: npm

## Core Features
1. **User Authentication**
   - Custom JWT-based authentication
   - User registration and login
   - Password hashing with bcrypt
   - Protected routes

2. **Task Management**
   - CRUD operations for tasks
   - Task status tracking (completed, pending, deleted)
   - Task priority levels
   - Due date management

3. **Activity History**
   - Comprehensive activity logging
   - Task creation, completion, deletion tracking
   - Restore deleted tasks functionality
   - Activity filtering and display

## Project Structure
```
crm-app/
├── src/
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── context/           # React Context providers
│   ├── routes/            # Express route handlers
│   └── utils/             # Utility functions
├── prisma/
│   └── schema.prisma      # Database schema
├── public/                # Static assets
└── server.js             # Express server setup
```

## Database Schema
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  tasks     Task[]
  activities Activity[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Task {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  completed   Boolean   @default(false)
  deleted     Boolean   @default(false)
  dueDate     DateTime?
  priority    String?
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  activities  Activity[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Activity {
  id        Int      @id @default(autoincrement())
  type      String   // created, completed, edited, deleted
  taskId    Int
  task      Task     @relation(fields: [taskId], references: [id])
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  taskData  String?  // JSON string of task data for restore functionality
  createdAt DateTime @default(now())
}
```

## Environment Setup
Required environment variables in `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-super-secret-jwt-key-please-change-in-production"
PORT=3000
```

## Authentication Flow
1. User registration:
   - Email and password validation
   - Password hashing with bcrypt
   - User creation in database
   - JWT token generation and return

2. User login:
   - Email/password verification
   - JWT token generation
   - Token returned to client

3. Protected routes:
   - JWT verification middleware
   - Token extraction from Authorization header
   - User data attached to request object

## Key Implementation Details

### Task Management
- Tasks are associated with users through userId
- Soft delete implementation (deleted flag)
- Task status tracking through boolean flags
- Priority levels: low, medium, high

### Activity Logging
- Activities created for all task operations
- Task data stored as JSON string for restore functionality
- Activity types: created, completed, edited, deleted
- Linked to both user and task through foreign keys

### Frontend Architecture
- React components with hooks
- Context API for state management
- Protected route components
- Responsive design with Tailwind CSS
- Form handling with controlled components

### API Endpoints
```javascript
// Authentication
POST /api/auth/register
POST /api/auth/login

// Tasks
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
POST /api/tasks/:id/restore

// Activities
GET /api/activities
```

## Development Workflow
1. **Local Development**
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

2. **Database Management**
   ```bash
   npx prisma studio  # Database GUI
   npx prisma db push # Schema updates
   ```

3. **Git Workflow**
   - Main branch for production
   - Feature branches for development
   - Pull requests for code review
   - Branch naming: feature/*, bugfix/*, etc.

## Security Considerations
1. **Authentication**
   - JWT tokens with expiration
   - Password hashing with bcrypt
   - Protected API routes

2. **Data Protection**
   - Input validation
   - SQL injection prevention (Prisma)
   - XSS protection
   - CORS configuration

3. **Environment**
   - Secure environment variables
   - Production configuration
   - Error handling

## Deployment Considerations
1. **Database**
   - PostgreSQL setup
   - Connection string security
   - Database backups

2. **Environment**
   - Production vs development configs
   - Secure key management
   - Port configuration

3. **Performance**
   - Build optimization
   - API response caching
   - Database indexing

## Future Enhancements
1. **Features**
   - Email notifications
   - Task categories/tags
   - User roles and permissions
   - Team collaboration

2. **Technical**
   - TypeScript migration
   - Test coverage
   - CI/CD pipeline
   - Performance monitoring

## Prompt for Recreation
To recreate this application structure, use the following prompt:

```
Create a full-stack CRM application with the following specifications:

1. Tech Stack:
   - Frontend: React.js with Vite
   - Backend: Express.js
   - Database: PostgreSQL with Prisma ORM
   - Authentication: Custom JWT
   - Styling: Tailwind CSS

2. Core Features:
   - User authentication (register/login)
   - Task management (CRUD operations)
   - Activity history tracking
   - Restore deleted tasks
   - Priority levels for tasks
   - Due date management

3. Database Requirements:
   - User model with authentication fields
   - Task model with status tracking
   - Activity model for logging
   - Proper relationships and constraints

4. Implementation Details:
   - Secure JWT authentication flow
   - Protected API routes
   - Activity logging for all task operations
   - Soft delete functionality
   - Task restore capability
   - Clean and modular code structure

5. Security Requirements:
   - Password hashing
   - Protected routes
   - Secure environment variables
   - Input validation
   - Error handling

Please implement this with a focus on code quality, security, and scalability. Include proper documentation and follow best practices for both frontend and backend development.
```

This prompt captures the essential elements of the application while allowing for flexibility in implementation details.
