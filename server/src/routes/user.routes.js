import { Router } from 'express';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { serializeProduct, ApiError } from '../utils/helpers.js';

export const userRouter = Router();
userRouter.use(requireAuth);

/* ---------- Sevimlilar ---------- */

userRouter.get('/favorites', (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.*, s.name AS shop_name FROM favorites f
       JOIN products p ON p.id = f.product_id
       JOIN shops s ON s.id = p.shop_id
       WHERE f.user_id = ? ORDER BY f.created_at DESC`
    )
    .all(req.user.id);
  res.json({ favorites: rows.map(serializeProduct) });
});

userRouter.post('/favorites/:productId', (req, res) => {
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.productId);
  if (!product) throw new ApiError(404, 'Mahsulot topilmadi');
  db.prepare('INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)').run(
    req.user.id,
    product.id
  );
  res.status(201).json({ ok: true });
});

userRouter.delete('/favorites/:productId', (req, res) => {
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?').run(
    req.user.id,
    req.params.productId
  );
  res.json({ ok: true });
});

/* ---------- Manzillar ---------- */

userRouter.get('/addresses', (req, res) => {
  const addresses = db
    .prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC')
    .all(req.user.id);
  res.json({ addresses });
});

userRouter.post('/addresses', (req, res) => {
  const { label = 'Uy', region, city, street, phone, is_default } = req.body || {};
  if (!region || !city || !street || !phone)
    throw new ApiError(400, 'Viloyat, shahar, ko‘cha va telefon majburiy');
  const tx = db.transaction(() => {
    if (is_default) db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    const count = db.prepare('SELECT COUNT(*) AS n FROM addresses WHERE user_id = ?').get(req.user.id).n;
    return db
      .prepare(
        'INSERT INTO addresses (user_id, label, region, city, street, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .run(req.user.id, label, region, city, street, phone, is_default || count === 0 ? 1 : 0);
  });
  const result = tx();
  const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ address });
});

userRouter.patch('/addresses/:id', (req, res) => {
  const addr = db
    .prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!addr) throw new ApiError(404, 'Manzil topilmadi');
  const { label, region, city, street, phone, is_default } = req.body || {};
  const tx = db.transaction(() => {
    if (is_default) db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    db.prepare(
      `UPDATE addresses SET label = COALESCE(?, label), region = COALESCE(?, region),
       city = COALESCE(?, city), street = COALESCE(?, street), phone = COALESCE(?, phone),
       is_default = COALESCE(?, is_default) WHERE id = ?`
    ).run(label ?? null, region ?? null, city ?? null, street ?? null, phone ?? null,
      is_default === undefined ? null : is_default ? 1 : 0, addr.id);
  });
  tx();
  res.json({ address: db.prepare('SELECT * FROM addresses WHERE id = ?').get(addr.id) });
});

userRouter.delete('/addresses/:id', (req, res) => {
  db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

/* ---------- Bildirishnomalar ---------- */

userRouter.get('/notifications', (req, res) => {
  const notifications = db
    .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50')
    .all(req.user.id);
  const unread = db
    .prepare('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read = 0')
    .get(req.user.id).n;
  res.json({ notifications, unread });
});

userRouter.post('/notifications/read', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});
