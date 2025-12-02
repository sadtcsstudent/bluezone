import bcrypt from 'bcryptjs';
import { config } from '../config';

export const hashPassword = (password: string) =>
  bcrypt.hash(password, config.bcryptRounds);

export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);
