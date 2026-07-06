import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'chust-market-dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  dbFile: process.env.DB_FILE || path.join(__dirname, '..', 'data', 'chust.db'),
  uploadsDir: process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads'),
  shippingFee: 15000, // so'm — buyurtma yetkazib berish narxi
  freeShippingFrom: 300000, // shu summadan yuqorida yetkazib berish bepul
};
