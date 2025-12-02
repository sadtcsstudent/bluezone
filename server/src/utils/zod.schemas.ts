import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

// User Schemas
export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    location: z.string().optional(),
    interests: z.array(z.string()).optional(),
    bio: z.string().optional(),
    emailPreferences: z.object({
      marketing: z.boolean().optional(),
      notifications: z.boolean().optional(),
    }).optional(),
  }),
});

// Event Schemas
export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid date format')),
    location: z.string().min(2, 'Location is required'),
    category: z.string().min(2, 'Category is required'),
    maxAttendees: z.number().int().positive().optional(),
    image: z.string().optional(),
  }),
});

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)).optional(),
    location: z.string().min(2).optional(),
    category: z.string().min(2).optional(),
    maxAttendees: z.number().int().positive().optional(),
    image: z.string().optional(),
  }),
});

// Group Schemas
export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.string().min(2, 'Category is required'),
    isPrivate: z.boolean().optional(),
    image: z.string().optional(),
  }),
});

export const updateGroupSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    category: z.string().min(2).optional(),
    isPrivate: z.boolean().optional(),
    image: z.string().optional(),
  }),
});

// Forum Schemas
export const createDiscussionSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    content: z.string().min(10, 'Content must be at least 10 characters'),
    category: z.string().min(2, 'Category is required'),
    tags: z.array(z.string()).optional(),
  }),
});

export const createReplySchema = z.object({
  body: z.object({
    content: z.string().min(2, 'Content must be at least 2 characters'),
  }),
});

// Newsletter Schemas
export const subscribeNewsletterSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const sendNewsletterSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title is required'),
    content: z.string().min(10, 'Content is required'),
    topics: z.array(z.string()).optional(),
    recipients: z.enum(['all', 'subscribers']).optional(),
  }),
});

// Message Schemas
export const startConversationSchema = z.object({
  body: z.object({
    recipientId: z.string().min(1, 'Recipient ID is required'),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content cannot be empty'),
  }),
});
