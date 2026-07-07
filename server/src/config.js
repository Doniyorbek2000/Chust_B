import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const isProduction = process.env.NODE_ENV === 'production';

// Production muhitida JWT_SECRET majburiy — busiz tokenlarni har kim yasay oladi
if (isProduction && !process.env.JWT_SECRET) {
  console.error('❌ XATO: production muhitida JWT_SECRET env o‘zgaruvchisi majburiy!');
  console.error('   Masalan: JWT_SECRET=$(openssl rand -hex 32) npm start');
  process.exit(1);
}

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'adm-bozor-dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  dbFile: process.env.DB_FILE || path.join(__dirname, '..', 'data', 'admbozor.db'),
  uploadsDir: process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads'),

  // CORS: productionda ruxsat etilgan originlar (vergul bilan ajratilgan).
  // Bo'sh qoldirilsa barcha originlarga ruxsat (faqat dev uchun tavsiya etiladi).
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  // Birinchi ishga tushishda admin yaratish uchun (agar bazada admin bo'lmasa)
  adminEmail: process.env.ADMIN_EMAIL || null,
  adminPassword: process.env.ADMIN_PASSWORD || null,

  shippingFee: Number(process.env.SHIPPING_FEE || 15000), // so'm
  freeShippingFrom: Number(process.env.FREE_SHIPPING_FROM || 300000),
};
