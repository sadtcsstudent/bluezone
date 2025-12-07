import type { SafeUser } from '../utils/serializers';

declare module 'express-serve-static-core' {
  interface Request {
    user?: SafeUser;
  }
}
