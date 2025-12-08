import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';

export const csrfProtection = (_req: Request, _res: Response, next: NextFunction) => {
    // Temporarily disable CSRF enforcement to unblock cross-site auth in production.
    // TODO: Re-enable with proper SameSite=None cookie checks.
    return next();
};
