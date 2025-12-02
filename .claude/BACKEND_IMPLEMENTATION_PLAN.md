# Blue Zone Twente - Complete Backend Implementation Instructions

## Mission

Build a complete, production-ready backend for Blue Zone Twente with:
- Full authentication system (local + OAuth)
- Real-time messaging
- Admin dashboard
- Image uploads
- Notifications
- All CRUD operations for events, forum, groups, initiatives

## Technology Stack (FINAL DECISIONS)

### Core Stack
- **Backend:** Express.js + TypeScript
- **Database:** Prisma ORM with SQLite (development) / PostgreSQL (production)
- **Auth:** JWT tokens in HTTP-only cookies + bcrypt password hashing + Passport.js for OAuth
- **Validation:** Zod schemas
- **Real-time:** Socket.io
- **File Upload:** Multer + Sharp (image processing)
- **Email:** Nodemailer

### Security Dependencies
```json
{
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "express-rate-limit": "^7.1.0",
  "hpp": "^0.2.3"
}
```

### Authentication Dependencies
```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "passport": "^0.7.0",
  "passport-google-oauth20": "^2.0.0",
  "passport-facebook": "^3.0.0"
}
```

### Other Key Dependencies
```json
{
  "zod": "^3.22.0",
  "nodemailer": "^6.9.0",
  "socket.io": "^4.6.0",
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.33.0",
  "winston": "^3.11.0"
}
```

---

## Project Structure

```
bluezone/
├── src/                          # Frontend (existing)
│   ├── assets/
│   ├── components/
│   ├── views/
│   └── ...
├── server/                       # NEW: Backend
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── events.controller.ts
│   │   │   ├── forum.controller.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── initiatives.controller.ts
│   │   │   └── newsletter.controller.ts
│   │   ├── routes/              # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── events.routes.ts
│   │   │   ├── forum.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── initiatives.routes.ts
│   │   │   └── newsletter.routes.ts
│   │   ├── middleware/          # Custom middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── rateLimiter.middleware.ts
│   │   ├── services/            # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── email.service.ts
│   │   │   └── token.service.ts
│   │   ├── prisma/              # Database
│   │   │   ├── schema.prisma    # Database schema
│   │   │   ├── seed.ts          # Initial data
│   │   │   └── migrations/      # DB migrations
│   │   ├── utils/               # Helpers
│   │   │   ├── errors.ts
│   │   │   ├── logger.ts
│   │   │   └── validators.ts
│   │   ├── types/               # TypeScript types
│   │   │   └── index.ts
│   │   ├── config/              # Configuration
│   │   │   └── index.ts
│   │   └── index.ts             # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                     # Environment variables
├── vite.config.js               # UPDATED: Proxy to backend
└── package.json                 # UPDATED: Concurrent scripts
```

---

## Database Schema Design

### Core Tables

#### 1. Users
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // bcrypt hashed
  name          String
  location      String?
  avatar        String?
  interests     String[]  // Array of interest tags
  newsletter    Boolean   @default(false)
  memberSince   DateTime  @default(now())
  lastLogin     DateTime?

  // Relations
  registrations EventRegistration[]
  discussions   Discussion[]
  replies       Reply[]
  groupMembers  GroupMember[]
  savedInitiatives SavedInitiative[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

#### 2. Events
```prisma
model Event {
  id            String    @id @default(cuid())
  title         String
  description   String
  date          DateTime
  time          String
  location      String
  category      String
  imageUrl      String
  maxAttendees  Int?
  organizerId   String

  // Relations
  registrations EventRegistration[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model EventRegistration {
  id            String    @id @default(cuid())
  userId        String
  eventId       String
  status        String    @default("registered") // registered, interested, attended

  user          User      @relation(fields: [userId], references: [id])
  event         Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)

  registeredAt  DateTime  @default(now())

  @@unique([userId, eventId])
}
```

#### 3. Forum System
```prisma
model Discussion {
  id            String    @id @default(cuid())
  title         String
  content       String
  category      String
  authorId      String
  views         Int       @default(0)

  author        User      @relation(fields: [authorId], references: [id])
  replies       Reply[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Reply {
  id            String    @id @default(cuid())
  content       String
  authorId      String
  discussionId  String

  author        User      @relation(fields: [authorId], references: [id])
  discussion    Discussion @relation(fields: [discussionId], references: [id], onDelete: Cascade)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

#### 4. Initiatives (Map)
```prisma
model Initiative {
  id            String    @id @default(cuid())
  name          String
  type          String    // garden, market, event, group
  location      String
  description   String
  coordinateX   Float
  coordinateY   Float
  contact       String?
  website       String?

  savedBy       SavedInitiative[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model SavedInitiative {
  id            String    @id @default(cuid())
  userId        String
  initiativeId  String

  user          User      @relation(fields: [userId], references: [id])
  initiative    Initiative @relation(fields: [initiativeId], references: [id], onDelete: Cascade)

  savedAt       DateTime  @default(now())

  @@unique([userId, initiativeId])
}
```

#### 5. Groups
```prisma
model Group {
  id            String    @id @default(cuid())
  name          String
  category      String
  description   String
  avatar        String?

  members       GroupMember[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model GroupMember {
  id            String    @id @default(cuid())
  userId        String
  groupId       String
  role          String    @default("member") // member, moderator, admin

  user          User      @relation(fields: [userId], references: [id])
  group         Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)

  joinedAt      DateTime  @default(now())

  @@unique([userId, groupId])
}
```

#### 6. Newsletter
```prisma
model NewsletterSubscriber {
  id            String    @id @default(cuid())
  email         String    @unique
  subscribed    Boolean   @default(true)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Newsletter {
  id            String    @id @default(cuid())
  title         String
  description   String
  topics        String[]
  publishedAt   DateTime
  fileUrl       String?

  createdAt     DateTime  @default(now())
}
```

---

## API Endpoints Design

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/signup`
- **Purpose:** Register new user
- **Body:** `{ name, email, password, location?, interests[], newsletter }`
- **Response:** `{ token, user }`
- **Security:**
  - Email validation
  - Password strength check (min 8 chars, complexity)
  - Rate limit: 5 requests per hour per IP
- **Actions:**
  - Hash password with bcrypt
  - Create user record
  - Generate JWT token
  - Send welcome email (if newsletter: true)

#### POST `/api/auth/login`
- **Purpose:** Authenticate user
- **Body:** `{ email, password, rememberMe? }`
- **Response:** `{ token, user }`
- **Security:**
  - Rate limit: 10 requests per 15 minutes per IP
  - Account lockout after 5 failed attempts
- **Actions:**
  - Verify credentials
  - Update lastLogin timestamp
  - Generate JWT (7d if rememberMe, else 24h)

#### POST `/api/auth/logout`
- **Purpose:** Invalidate token
- **Auth Required:** Yes
- **Response:** `{ success: true }`

#### GET `/api/auth/me`
- **Purpose:** Get current user info
- **Auth Required:** Yes
- **Response:** `{ user }`

### Events Routes (`/api/events`)

#### GET `/api/events`
- **Purpose:** List all events with filtering
- **Query Params:** `{ search?, category?, sort?, limit?, offset? }`
- **Response:** `{ events[], total, page, limit }`
- **Caching:** 5 minutes
- **Features:**
  - Full-text search on title/description
  - Category filtering
  - Sort by date, attendees, popularity
  - Pagination

#### GET `/api/events/:id`
- **Purpose:** Get single event details
- **Response:** `{ event, isRegistered (if auth), attendees[] }`

#### POST `/api/events/:id/register`
- **Purpose:** Register for event
- **Auth Required:** Yes
- **Body:** `{ status: "registered" | "interested" }`
- **Response:** `{ success, event }`
- **Validation:** Check max attendees limit

#### DELETE `/api/events/:id/register`
- **Purpose:** Unregister from event
- **Auth Required:** Yes
- **Response:** `{ success }`

### Forum Routes (`/api/forum`)

#### GET `/api/forum/discussions`
- **Purpose:** List discussions
- **Query Params:** `{ search?, category?, sort?, limit?, offset? }`
- **Response:** `{ discussions[], total }`
- **Sort options:** recent, popular, active

#### POST `/api/forum/discussions`
- **Purpose:** Create new discussion
- **Auth Required:** Yes
- **Body:** `{ title, content, category }`
- **Response:** `{ discussion }`
- **Validation:**
  - Title: 5-200 chars
  - Content: 10-10000 chars
  - Category: valid enum

#### GET `/api/forum/discussions/:id`
- **Purpose:** Get discussion with replies
- **Response:** `{ discussion, replies[] }`
- **Side Effect:** Increment view count

#### POST `/api/forum/discussions/:id/replies`
- **Purpose:** Reply to discussion
- **Auth Required:** Yes
- **Body:** `{ content }`
- **Response:** `{ reply }`

### User Routes (`/api/users`)

#### GET `/api/users/me`
- **Purpose:** Get current user profile
- **Auth Required:** Yes
- **Response:** `{ user, stats: { eventsAttended, groupsJoined, forumPosts } }`

#### PUT `/api/users/me`
- **Purpose:** Update profile
- **Auth Required:** Yes
- **Body:** `{ name?, location?, interests?, avatar? }`
- **Response:** `{ user }`

#### GET `/api/users/me/events`
- **Purpose:** Get user's registered events
- **Auth Required:** Yes
- **Response:** `{ upcoming[], past[] }`

#### GET `/api/users/me/groups`
- **Purpose:** Get user's groups
- **Auth Required:** Yes
- **Response:** `{ groups[] }`

#### GET `/api/users/me/saved-initiatives`
- **Purpose:** Get saved initiatives
- **Auth Required:** Yes
- **Response:** `{ initiatives[] }`

### Initiatives Routes (`/api/initiatives`)

#### GET `/api/initiatives`
- **Purpose:** Get all map initiatives
- **Query Params:** `{ type?, search? }`
- **Response:** `{ initiatives[] }`

#### POST `/api/initiatives/:id/save`
- **Purpose:** Save/bookmark initiative
- **Auth Required:** Yes
- **Response:** `{ success }`

#### DELETE `/api/initiatives/:id/save`
- **Purpose:** Unsave initiative
- **Auth Required:** Yes
- **Response:** `{ success }`

### Newsletter Routes (`/api/newsletter`)

#### POST `/api/newsletter/subscribe`
- **Purpose:** Subscribe to newsletter
- **Body:** `{ email }`
- **Response:** `{ success, message }`
- **Rate Limit:** 3 per hour per IP
- **Action:** Send confirmation email

#### GET `/api/newsletter/past`
- **Purpose:** Get newsletter archive
- **Response:** `{ newsletters[] }`

---

## Security Implementation

### 1. Authentication Middleware
```typescript
// Verify JWT token
// Attach user to request
// Handle expired tokens
```

### 2. Rate Limiting Strategy
- **Auth endpoints:** Strict (5-10 req/15min)
- **Read endpoints:** Generous (100 req/15min)
- **Write endpoints:** Moderate (30 req/15min)
- **Per-IP and per-user limits**

### 3. Input Validation
- **Zod schemas** for all request bodies
- **SQL injection prevention** (Prisma handles this)
- **XSS prevention** with sanitization
- **CSRF tokens** for state-changing operations

### 4. Security Headers (helmet)
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

### 5. CORS Configuration
```typescript
{
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}
```

### 6. Password Security
- **Bcrypt rounds:** 12
- **Minimum requirements:** 8 chars, 1 uppercase, 1 number
- **No common passwords** (optional: check against breach DB)

---

## Concurrency Handling (MANDATORY)

YOU MUST implement these patterns to prevent race conditions:

### 1. Event Registration Capacity Check
```typescript
// server/src/controllers/events.controller.ts
export async function registerForEvent(req, res) {
  const { eventId } = req.params;
  const userId = req.user.id;

  await prisma.$transaction(async (tx) => {
    // Lock event row
    const event = await tx.event.findUnique({
      where: { id: eventId },
      include: { registrations: true }
    });

    if (!event) throw new Error('Event not found');

    const currentCount = event.registrations.length;

    if (event.maxAttendees && currentCount >= event.maxAttendees) {
      throw new Error('Event is full');
    }

    // Create registration atomically
    const registration = await tx.eventRegistration.create({
      data: {
        userId,
        eventId,
        status: req.body.status || 'registered'
      }
    });

    return registration;
  });
}
```

### 2. Unique Constraints (Database Level)
Add these to Prisma schema:
```prisma
@@unique([userId, eventId])  // EventRegistration
@@unique([userId, initiativeId])  // SavedInitiative
@@unique([userId, groupId])  // GroupMember
@@unique([conversationId, userId])  // ConversationParticipant
```

### 3. Idempotent Operations
For save/unsave operations, use `upsert` or `createMany` with `skipDuplicates: true`

---

## Frontend Integration (EXACT IMPLEMENTATION)

### Step 1: Install Frontend Dependencies
```bash
cd /c/Users/User/Desktop/blue/bluezone
yarn add axios pinia socket.io-client
```

### Step 2: Create API Service Layer
Create `src/services/api.js`:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
```

### Step 3: Create Pinia Stores
Create `src/stores/auth.js`:
```javascript
import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    loading: false
  }),

  actions: {
    async login(email, password, rememberMe) {
      this.loading = true;
      try {
        const data = await api.post('/auth/login', { email, password, rememberMe });
        this.user = data.user;
        this.isLoggedIn = true;
        return data;
      } finally {
        this.loading = false;
      }
    },

    async signup(formData) {
      this.loading = true;
      try {
        const data = await api.post('/auth/signup', formData);
        this.user = data.user;
        this.isLoggedIn = true;
        return data;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      await api.post('/auth/logout');
      this.user = null;
      this.isLoggedIn = false;
    },

    async fetchUser() {
      try {
        const data = await api.get('/auth/me');
        this.user = data.user;
        this.isLoggedIn = true;
      } catch {
        this.user = null;
        this.isLoggedIn = false;
      }
    }
  }
});
```

### Step 4: Update Vite Config
Edit `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
})
```

### Step 5: Initialize Pinia in main.js
Edit `src/main.js`:
```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
```

### Step 6: Update App.vue
Replace isLoggedIn logic with Pinia store:
```javascript
<script>
import { useAuthStore } from '@/stores/auth';

export default {
  setup() {
    const authStore = useAuthStore();

    // Fetch user on app mount
    authStore.fetchUser();

    return { authStore };
  }
}
</script>

<template>
  <Navigation :isLoggedIn="authStore.isLoggedIn" :currentPage="$route.name" />
  <RouterView />
  <Footer />
</template>
```

---



---

## Additional Features to Implement

### 1. Private Messaging System

**Frontend Evidence:** Navigation.vue shows "Messages" button when logged in (lines 34-36, 72-75)

**Database Schema:**
```prisma
model Conversation {
  id            String    @id @default(cuid())
  participants  ConversationParticipant[]
  messages      Message[]
  lastMessage   DateTime  @updatedAt
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model ConversationParticipant {
  id              String    @id @default(cuid())
  conversationId  String
  userId          String
  unreadCount     Int       @default(0)
  lastRead        DateTime  @default(now())

  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([conversationId, userId])
}

model Message {
  id              String    @id @default(cuid())
  conversationId  String
  senderId        String
  content         String
  read            Boolean   @default(false)

  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender          User      @relation(fields: [senderId], references: [id])

  createdAt       DateTime  @default(now())
}
```

**API Endpoints:**
- `GET /api/messages/conversations` - List user's conversations
- `GET /api/messages/conversations/:id` - Get conversation with messages
- `POST /api/messages/conversations` - Start new conversation (body: { recipientId })
- `POST /api/messages/conversations/:id/messages` - Send message (body: { content })
- `PUT /api/messages/conversations/:id/read` - Mark messages as read
- `GET /api/messages/unread-count` - Get unread message count

**Frontend Implementation:**
- Create `/src/views/MessagesView.vue` page
- List of conversations with last message preview
- Click to open conversation detail
- Send new messages
- Real-time updates (polling initially, WebSocket later)

---

### 2. Password Reset Flow

**Frontend Evidence:** LoginView.vue has "Forgot password?" link (line 38-40)

**Database Schema:**
```prisma
model PasswordResetToken {
  id            String    @id @default(cuid())
  userId        String
  token         String    @unique
  expires       DateTime
  used          Boolean   @default(false)

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt     DateTime  @default(now())
}
```

**API Endpoints:**
- `POST /api/auth/forgot-password` - Request reset (body: { email })
- `POST /api/auth/reset-password` - Reset with token (body: { token, newPassword })
- `GET /api/auth/verify-reset-token/:token` - Verify token validity

**Email Service:**
- Send password reset email with token link
- Token expires after 1 hour
- Email template with reset link

**Frontend Implementation:**
- Create `/src/views/ForgotPasswordView.vue`
- Create `/src/views/ResetPasswordView.vue`
- Link from LoginView forgot password button

---

### 3. Social Login (OAuth)

**Frontend Evidence:** LoginView.vue shows Google and Facebook buttons (lines 93-95)

**Implementation:**
- Use **Passport.js** with OAuth strategies
- Google OAuth 2.0
- Facebook Login
- Link accounts to existing users by email

**Database Schema Updates:**
```prisma
model User {
  // ... existing fields
  googleId      String?   @unique
  facebookId    String?   @unique
  authProvider  String    @default("local") // local, google, facebook
}
```

**API Endpoints:**
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Handle Google callback
- `GET /api/auth/facebook` - Initiate Facebook OAuth
- `GET /api/auth/facebook/callback` - Handle Facebook callback

**Dependencies:**
```json
"passport": "^0.7.0",
"passport-google-oauth20": "^2.0.0",
"passport-facebook": "^3.0.0"
```

---

### 4. Group Management (Full CRUD)

**Frontend Evidence:** ProfileView shows groups, ForumView has "Browse More" for groups

**API Endpoints:**
- `GET /api/groups` - List all groups (with search/filter)
- `POST /api/groups` - Create new group (auth required)
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group (moderator/admin only)
- `DELETE /api/groups/:id` - Delete group (admin only)
- `POST /api/groups/:id/join` - Join group
- `DELETE /api/groups/:id/leave` - Leave group
- `PUT /api/groups/:id/members/:userId/role` - Update member role (moderator/admin)

**Frontend Implementation:**
- Create `/src/views/GroupsView.vue` - Browse all groups
- Create `/src/views/GroupDetailView.vue` - Group page with members, discussions
- Add "Create Group" button to groups page

---

### 5. Trending Topics Algorithm

**Implementation:**
- Calculate trending based on:
  - Recent activity (replies in last 24-48 hours)
  - View count velocity
  - Reply count
  - Weighted score formula

**API Endpoint:**
- `GET /api/forum/trending` - Get trending topics

**Database Query:**
```typescript
// Trending algorithm
const trending = await prisma.discussion.findMany({
  where: {
    createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
  },
  orderBy: [
    { replies: { _count: 'desc' } },
    { views: 'desc' }
  ],
  take: 5
})
```

---

### 6. Event Detail Page

**Frontend Evidence:** EventCard has "View Details" button that currently just console.logs

**Frontend Implementation:**
- Create `/src/views/EventDetailView.vue`
- Show full event information
- Attendee list
- Location map embed
- Register/Unregister button
- Share event button
- Add to calendar button

**API Enhancements:**
- `GET /api/events/:id/attendees` - Get attendee list
- Include full attendee details in event response

---

### 7. Discussion Detail Page

**Frontend Evidence:** ForumCard needs to link to discussion page

**Frontend Implementation:**
- Create `/src/views/DiscussionDetailView.vue`
- Show discussion with all replies
- Reply form
- Upvote/like functionality (optional)
- Edit/delete own discussion (if author)
- Edit/delete own replies (if author)

**API Enhancements:**
- `PUT /api/forum/discussions/:id` - Edit discussion (author only)
- `DELETE /api/forum/discussions/:id` - Delete discussion (author/moderator)
- `PUT /api/forum/discussions/:id/replies/:replyId` - Edit reply
- `DELETE /api/forum/discussions/:id/replies/:replyId` - Delete reply

---

### 8. Account Settings Page

**Frontend Evidence:** ProfileView has "Account Settings" button

**Frontend Implementation:**
- Create `/src/views/SettingsView.vue`
- Change password form
- Email preferences (newsletter, notifications)
- Privacy settings
- Delete account option

**API Endpoints:**
- `PUT /api/users/me/password` - Change password
- `PUT /api/users/me/email` - Change email (with verification)
- `PUT /api/users/me/preferences` - Update preferences
- `DELETE /api/users/me` - Delete account

**Database Schema Addition:**
```prisma
model User {
  // ... existing fields
  preferences   Json?  // { notifications: { email: bool, push: bool }, privacy: { ... } }
}
```

---

### 9. Admin Dashboard

**Implementation:**
- Admin role in User model
- Protected admin routes
- Admin panel for:
  - User management (view, suspend, delete users)
  - Content moderation (edit/delete discussions, events)
  - Event creation/management
  - Newsletter creation
  - View analytics

**Database Schema:**
```prisma
model User {
  // ... existing fields
  role          String    @default("user") // user, moderator, admin
  suspended     Boolean   @default(false)
}
```

**API Endpoints:**
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/suspend` - Suspend user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/:id` - Edit event
- `DELETE /api/admin/events/:id` - Delete event
- `GET /api/admin/stats` - Get platform statistics

---

### 10. Notifications System

**Implementation:**
- Email notifications for:
  - New message received
  - Event registration confirmation
  - Event reminder (24h before)
  - Reply to your discussion
  - Someone joins your group
  - Newsletter published

**Database Schema:**
```prisma
model Notification {
  id            String    @id @default(cuid())
  userId        String
  type          String    // message, event, reply, group
  title         String
  content       String
  read          Boolean   @default(false)
  link          String?   // URL to navigate to

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt     DateTime  @default(now())
}
```

**API Endpoints:**
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

**Frontend:**
- Bell icon in navigation with unread count
- Notifications dropdown
- Notification preferences in settings

---

### 11. Image Upload System

**Implementation:**
- User avatar uploads
- Event image uploads
- Group avatar uploads
- Use **Multer** for file handling
- Store in `/uploads` directory or S3/Cloudinary

**Dependencies:**
```json
"multer": "^1.4.5-lts.1",
"sharp": "^0.33.0"  // Image processing
```

**API Endpoints:**
- `POST /api/upload/avatar` - Upload user avatar
- `POST /api/upload/event-image` - Upload event image
- `POST /api/upload/group-avatar` - Upload group avatar

**Image Processing:**
- Resize images automatically
- Generate thumbnails
- Optimize file size
- Validate file types (jpg, png, webp)
- Max file size: 5MB

---

### 12. Real-time Features (WebSocket)

**Implementation:**
- Use **Socket.io** for real-time updates
- Real-time messaging
- Live forum updates (new replies)
- Online user presence

**Dependencies:**
```json
"socket.io": "^4.6.0"
```

**Backend Setup:**
```typescript
// server/src/socket.ts
import { Server } from 'socket.io';

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL }
  });

  io.on('connection', (socket) => {
    // Join user room
    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
    });

    // Message events
    socket.on('message:send', async (data) => {
      // Save to DB, emit to recipient
    });
  });

  return io;
};
```

---

## IMPLEMENTATION INSTRUCTIONS - FOLLOW EXACTLY

### PHASE 1: Project Setup & Database (START HERE)

#### 1.1 Create Server Directory
```bash
cd /c/Users/User/Desktop/blue/bluezone
mkdir server
cd server
npm init -y
```

#### 1.2 Install ALL Dependencies
```bash
npm install express prisma @prisma/client bcryptjs jsonwebtoken zod helmet cors express-rate-limit nodemailer dotenv winston socket.io multer sharp passport passport-google-oauth20 passport-facebook hpp express-validator
npm install --save-dev typescript @types/express @types/bcryptjs @types/jsonwebtoken @types/cors @types/nodemailer tsx nodemon @faker-js/faker @types/node @types/multer @types/passport @types/passport-google-oauth20 @types/passport-facebook
```

#### 1.3 Create tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### 1.4 Create Directory Structure
```bash
mkdir -p src/{controllers,routes,middleware,services,utils,types,config,prisma}
mkdir uploads
```

#### 1.5 Initialize Prisma
```bash
npx prisma init
```

#### 1.6 Create Complete Prisma Schema
Edit `prisma/schema.prisma` and paste the ENTIRE schema from the "Database Schema Design" section above. Include ALL models:
- User (with role, googleId, facebookId, authProvider, preferences)
- Event + EventRegistration
- Discussion + Reply
- Initiative + SavedInitiative
- Group + GroupMember
- NewsletterSubscriber + Newsletter
- Conversation + ConversationParticipant + Message
- PasswordResetToken
- Notification

#### 1.7 Run Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### 1.8 Create Seed Script
Create `prisma/seed.ts` and implement seeding for:
- 6 events from frontend
- 8 forum discussions with replies
- 7 initiatives with coordinates
- 3 groups
- 4 newsletters
- 2-3 test users (hash passwords with bcrypt)

#### 1.9 Run Seed
```bash
npx prisma db seed
```

---

### PHASE 2: Core Server Setup

#### 2.1 Create Environment File
Create `.env`:
```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@bluezonetw ente.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

#### 2.2 Create Config File
Create `src/config/index.ts`:
```typescript
export const config = {
  port: process.env.PORT || 4000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET
    }
  }
};
```

#### 2.3 Create Logger
Create `src/utils/logger.ts`:
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

#### 2.4 Create Error Handler
Create `src/utils/errors.ts`:
```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (err: any, req: any, res: any, next: any) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`Error: ${message}`, { statusCode, stack: err.stack });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

---

### PHASE 3: Authentication System (CRITICAL)

#### 3.1 Create JWT Service
Create `src/services/token.service.ts`:
```typescript
import jwt from 'jsonwebtoken';
import { config } from '../config';

export const generateToken = (userId: string, rememberMe: boolean = false) => {
  return jwt.sign(
    { userId },
    config.jwtSecret,
    { expiresIn: rememberMe ? '30d' : '24h' }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret) as { userId: string };
};
```

#### 3.2 Create Auth Middleware
Create `src/middleware/auth.middleware.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/token.service';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError(401, 'Authentication required');
    }

    const { userId } = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.suspended) {
      throw new AppError(401, 'Invalid or suspended user');
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError(401, 'Invalid token'));
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'Insufficient permissions');
    }
    next();
  };
}
```

#### 3.3 Create Auth Controller
Create `src/controllers/auth.controller.ts` with functions:
- `signup` - hash password with bcrypt, create user, generate JWT, send welcome email
- `login` - verify credentials, generate JWT, update lastLogin
- `logout` - clear cookie
- `getMe` - return current user
- `forgotPassword` - generate reset token, send email
- `resetPassword` - verify token, update password

#### 3.4 Create Auth Routes
Create `src/routes/auth.routes.ts` with all auth endpoints

#### 3.5 Setup Passport OAuth
Create `src/config/passport.ts` with Google and Facebook strategies

---

### PHASE 4: Implement ALL API Endpoints

YOU MUST implement EVERY endpoint listed in the "API Endpoints Design" section. For EACH endpoint:

1. Create Zod validation schema
2. Create controller function with proper error handling
3. Add to routes file
4. Test with proper data

#### 4.1 Events Module
- Implement all 4 event endpoints
- Include capacity check transaction
- Add attendee list endpoint

#### 4.2 Forum Module
- Implement all 4 forum endpoints
- Add trending topics endpoint
- Implement view count increment

#### 4.3 Groups Module
- Implement all 8 group endpoints
- Include role-based permissions

#### 4.4 Users Module
- Implement all 5 user endpoints
- Include stats calculation

#### 4.5 Initiatives Module
- Implement all 3 initiative endpoints

#### 4.6 Newsletter Module
- Implement both endpoints
- Setup email sending

#### 4.7 Messages Module
- Implement all 6 message endpoints
- Include unread count logic

#### 4.8 Notifications Module
- Implement all 4 notification endpoints
- Setup email notifications

#### 4.9 Admin Module
- Implement all 7 admin endpoints
- Add admin authorization checks

#### 4.10 Upload Module
- Implement image upload with Multer
- Add Sharp image processing
- Validate file types and sizes

---

### PHASE 5: Real-time Features

#### 5.1 Setup Socket.io
Create `src/socket.ts` exactly as shown in section 12

#### 5.2 Integrate with Express
Update main server file to attach Socket.io

#### 5.3 Implement Real-time Events
- Message sending/receiving
- Online presence
- Live notifications

---

### PHASE 6: Security Implementation

#### 6.1 Add Rate Limiting
Apply rate limiters to all routes as specified

#### 6.2 Add Security Headers
Use helmet middleware

#### 6.3 Setup CORS
Configure CORS with credentials

#### 6.4 Input Validation
Add Zod schemas to ALL endpoints

#### 6.5 SQL Injection Prevention
Ensured by Prisma (already done)

---

### PHASE 7: Frontend Integration

Follow steps 1-6 in "Frontend Integration (EXACT IMPLEMENTATION)" section above

Then update EVERY view component to use real API calls instead of mock data:
- LoginView.vue
- SignupView.vue
- EventsView.vue
- ForumView.vue
- ProfileView.vue
- NewsletterView.vue
- MapView.vue

Create NEW view components:
- MessagesView.vue
- EventDetailView.vue
- DiscussionDetailView.vue
- SettingsView.vue
- GroupsView.vue
- GroupDetailView.vue
- ForgotPasswordView.vue
- ResetPasswordView.vue
- AdminDashboardView.vue (if admin)

---

### PHASE 8: Testing & Polish

#### 8.1 Test Every Endpoint
Use Postman or similar to test ALL endpoints

#### 8.2 Test Race Conditions
Try simultaneous event registrations

#### 8.3 Test Authentication Flow
Login, logout, JWT expiry, OAuth

#### 8.4 Test File Uploads
Upload images, check processing

#### 8.5 Test Real-time
Open multiple browser tabs, send messages

---

### PHASE 9: Deployment Preparation

#### 9.1 Update package.json Scripts
```json
{
  "scripts": {
    "dev": "nodemon --exec tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:generate": "prisma generate"
  }
}
```

#### 9.2 Setup Production Environment
- Switch DATABASE_URL to PostgreSQL
- Update all secrets
- Configure email service

#### 9.3 Create Deployment Documentation
Document deployment steps for your hosting platform

**TOTAL: All features implemented, fully functional, production-ready**

---

## END - START IMPLEMENTING NOW

Execute PHASE 1 through PHASE 9 in exact order. Implement every single feature, endpoint, and component listed above.
