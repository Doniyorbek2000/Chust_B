import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

/** API xatolik klassi — status kodi bilan */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Express async handlerlarni xatolik middleware'ga ulash */
export const asyncH = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function parseJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

/** Mahsulot qatorini API javobiga tayyorlash */
export function serializeProduct(row) {
  if (!row) return null;
  const images = parseJson(row.images, []);
  return {
    ...row,
    images,
    image: images[0] || null,
    attributes: parseJson(row.attributes, {}),
    discount_percent:
      row.old_price && row.old_price > row.price
        ? Math.round((1 - row.price / row.old_price) * 100)
        : 0,
  };
}

export function getPagination(query, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
}

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export const ORDER_STATUS_LABELS = {
  pending: 'Kutilmoqda',
  confirmed: 'Tasdiqlandi',
  shipped: "Yo'lda",
  delivered: 'Yetkazildi',
  cancelled: 'Bekor qilindi',
};
