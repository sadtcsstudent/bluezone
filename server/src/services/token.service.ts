import jwt from 'jsonwebtoken';
import { config } from '../config';

export const generateToken = (userId: string, rememberMe = false) =>
  jwt.sign({ userId }, config.jwtSecret, { expiresIn: rememberMe ? '7d' : '24h' });

export const verifyToken = (token: string) =>
  jwt.verify(token, config.jwtSecret) as { userId: string };
