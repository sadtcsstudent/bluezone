import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
    // Disable CSRF in development mode
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }

    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        // Generate new token if not present
        if (!req.cookies[CSRF_COOKIE_NAME]) {
            const token = crypto.randomBytes(32).toString('hex');
            res.cookie(CSRF_COOKIE_NAME, token, {
                httpOnly: false, // Allow frontend to read it
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
        }
        return next();
    }

    const token = req.headers[CSRF_HEADER_NAME.toLowerCase()] || req.headers[CSRF_HEADER_NAME];
    const cookieToken = req.cookies[CSRF_COOKIE_NAME];

    if (!token || !cookieToken || token !== cookieToken) {
        return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    next();
};
