import { db } from '../db/connection.js';
import { verifyToken, ApiError } from '../utils/helpers.js';

/** Token bo'lsa foydalanuvchini o'qiydi, bo'lmasa jim o'tadi */
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = verifyToken(token);
      const user = db
        .prepare('SELECT id, name, email, phone, role, avatar, status FROM users WHERE id = ?')
        .get(payload.id);
      if (user && user.status === 'active') req.user = user;
    } catch {
      /* yaroqsiz token — anonim davom etadi */
    }
  }
  next();
}

export function requireAuth(req, _res, next) {
  if (!req.user) return next(new ApiError(401, 'Avtorizatsiya talab qilinadi'));
  next();
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, 'Avtorizatsiya talab qilinadi'));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, 'Ruxsat yo‘q'));
    next();
  };
}

/** Sotuvchining tasdiqlangan do'konini req.shop ga yuklaydi */
export function loadShop(req, _res, next) {
  const shop = db.prepare('SELECT * FROM shops WHERE seller_id = ?').get(req.user.id);
  if (!shop) return next(new ApiError(404, 'Do‘kon topilmadi'));
  if (shop.status === 'blocked') return next(new ApiError(403, 'Do‘kon bloklangan'));
  req.shop = shop;
  next();
}
