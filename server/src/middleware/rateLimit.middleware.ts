import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: { status: 'error', message: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 signup requests per windowMs
    message: { status: 'error', message: 'Too many accounts created from this IP, please try again after an hour' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { status: 'error', message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 upload requests per windowMs
    message: { status: 'error', message: 'Upload limit exceeded, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const readLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Higher limit for reads
    message: { status: 'error', message: 'Too many read requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Lower limit for writes
    message: { status: 'error', message: 'Too many write requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const newsletterLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 newsletter requests per windowMs
    message: { status: 'error', message: 'Too many newsletter requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
