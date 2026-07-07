import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError } from '../utils/helpers.js';

export const uploadRouter = Router();

fs.mkdirSync(config.uploadsDir, { recursive: true });

const ALLOWED = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadsDir),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ALLOWED[file.mimetype]}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED[file.mimetype]) cb(null, true);
    else cb(new ApiError(400, 'Faqat JPG, PNG, WEBP yoki GIF rasm yuklash mumkin'));
  },
});

/** Rasm(lar) yuklash — javobda URL lar */
uploadRouter.post('/', requireAuth, upload.array('images', 5), (req, res) => {
  if (!req.files?.length) throw new ApiError(400, 'Rasm tanlanmagan');
  const urls = req.files.map((f) => `/uploads/${path.basename(f.path)}`);
  res.status(201).json({ urls });
});
