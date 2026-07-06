import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/connection.js';
import { signToken, ApiError, asyncH } from '../utils/helpers.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

/** Ro'yxatdan o'tish — haridor yoki sotuvchi */
authRouter.post(
  '/register',
  asyncH(async (req, res) => {
    const { name, email, phone, password, role = 'buyer', shopName } = req.body || {};
    if (!name || String(name).trim().length < 2) throw new ApiError(400, 'Ism kamida 2 ta belgi bo‘lishi kerak');
    if (!EMAIL_RE.test(email || '')) throw new ApiError(400, 'Email noto‘g‘ri formatda');
    if (!password || String(password).length < 6) throw new ApiError(400, 'Parol kamida 6 ta belgi bo‘lishi kerak');
    if (!['buyer', 'seller'].includes(role)) throw new ApiError(400, 'Rol noto‘g‘ri');
    if (role === 'seller' && (!shopName || String(shopName).trim().length < 2))
      throw new ApiError(400, 'Do‘kon nomini kiriting');

    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (exists) throw new ApiError(409, 'Bu email allaqachon ro‘yxatdan o‘tgan');

    const hash = await bcrypt.hash(String(password), 10);
    const result = db
      .prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)')
      .run(String(name).trim(), String(email).toLowerCase(), phone || null, hash, role);

    if (role === 'seller') {
      db.prepare('INSERT INTO shops (seller_id, name) VALUES (?, ?)').run(
        result.lastInsertRowid,
        String(shopName).trim()
      );
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  })
);

/** Kirish */
authRouter.post(
  '/login',
  asyncH(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) throw new ApiError(400, 'Email va parolni kiriting');

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email));
    if (!user || !(await bcrypt.compare(String(password), user.password_hash)))
      throw new ApiError(401, 'Email yoki parol noto‘g‘ri');
    if (user.status === 'blocked') throw new ApiError(403, 'Hisobingiz bloklangan');

    res.json({ token: signToken(user), user: publicUser(user) });
  })
);

/** Joriy foydalanuvchi */
authRouter.get('/me', requireAuth, (req, res) => {
  const user = req.user;
  let shop = null;
  if (user.role === 'seller') {
    shop = db.prepare('SELECT * FROM shops WHERE seller_id = ?').get(user.id);
  }
  res.json({ user, shop });
});

/** Profilni yangilash */
authRouter.patch('/me', requireAuth, (req, res) => {
  const { name, phone, avatar } = req.body || {};
  if (name !== undefined && String(name).trim().length < 2)
    throw new ApiError(400, 'Ism kamida 2 ta belgi bo‘lishi kerak');
  db.prepare(
    'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar) WHERE id = ?'
  ).run(name !== undefined ? String(name).trim() : null, phone ?? null, avatar ?? null, req.user.id);
  const user = db
    .prepare('SELECT id, name, email, phone, role, avatar, status FROM users WHERE id = ?')
    .get(req.user.id);
  res.json({ user });
});

/** Parolni almashtirish */
authRouter.post(
  '/change-password',
  requireAuth,
  asyncH(async (req, res) => {
    const { oldPassword, newPassword } = req.body || {};
    if (!newPassword || String(newPassword).length < 6)
      throw new ApiError(400, 'Yangi parol kamida 6 ta belgi bo‘lishi kerak');
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!(await bcrypt.compare(String(oldPassword || ''), user.password_hash)))
      throw new ApiError(401, 'Joriy parol noto‘g‘ri');
    const hash = await bcrypt.hash(String(newPassword), 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
    res.json({ ok: true });
  })
);
