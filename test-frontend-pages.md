# Frontend Testing Checklist

Open http://localhost:3000 and test each page manually:

## Public Pages (No Auth Required)
- [ ] **Home** (`/`) - Check if loads without errors
- [ ] **Story** (`/story`) - Check content loads
- [ ] **About** (`/about`) - Check content loads
- [ ] **Login** (`/login`) - Try logging in with: danielbote05@gmail.com (password you set)
- [ ] **Signup** (`/signup`) - Check form validation
- [ ] **Forgot Password** (`/forgot-password`) - Check email input
- [ ] **Newsletter** (`/newsletter`) - Check subscription form

## Auth Required Pages (Login First)
- [ ] **Events** (`/events`) - Check if events list loads
- [ ] **Event Detail** (`/events/:id`) - Click on an event to view details
- [ ] **Forum** (`/forum`) - Check discussions list
- [ ] **Discussion Detail** (`/forum/:id`) - Click on a discussion
- [ ] **Groups** (`/groups`) - Check groups list
- [ ] **Group Detail** (`/groups/:id`) - Click on a group
- [ ] **Map** (`/map`) - Check if map component loads
- [ ] **Messages** (`/messages`) - Check messages/conversations
- [ ] **Profile** (`/profile`) - Check your user profile
- [ ] **Settings** (`/settings`) - Check settings form
- [ ] **Admin Dashboard** (`/admin`) - Only works if you're admin

## Testing Method

For each page:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to the page
4. Look for RED errors (ignore warnings)
5. If you see errors, copy the error message

## Common Issues to Look For

- ❌ **404 Not Found** - API endpoint doesn't exist
- ❌ **401 Unauthorized** - Not logged in or token expired
- ❌ **500 Internal Server Error** - Backend code is broken
- ❌ **Cannot read property of undefined** - Frontend trying to access data that doesn't exist
- ❌ **Network Error** - Can't reach API at all
