import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/errors';

const ensureUploadsDir = () => {
  const dir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const processImage = async (file: Express.Multer.File, prefix: string) => {
  if (!file) throw new AppError(400, 'File required');
  const uploadsDir = ensureUploadsDir();
  const filename = `${prefix}-${Date.now()}.webp`;
  const filepath = path.join(uploadsDir, filename);
  await sharp(file.buffer).resize(800, 800, { fit: 'inside' }).toFormat('webp').toFile(filepath);
  return `/uploads/${filename}`;
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = await processImage(req.file as Express.Multer.File, 'avatar');
    res.json({ url });
  } catch (error) {
    next(error);
  }
};

export const uploadEventImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = await processImage(req.file as Express.Multer.File, 'event');
    res.json({ url });
  } catch (error) {
    next(error);
  }
};

export const uploadGroupAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = await processImage(req.file as Express.Multer.File, 'group');
    res.json({ url });
  } catch (error) {
    next(error);
  }
};
