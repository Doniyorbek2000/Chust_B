import { Router } from 'express';
import { db } from '../db/connection.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  serializeProduct, getPagination, ApiError, ORDER_STATUS_LABELS,
} from '../utils/helpers.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('admin'));

/** Platforma dashboardi */
adminRouter.get('/dashboard', (_req, res) => {
  const stat = (sql) => db.prepare(sql).get();
  const stats = {
    users: stat("SELECT COUNT(*) AS n FROM users WHERE role = 'buyer'").n,
    sellers: stat("SELECT COUNT(*) AS n FROM users WHERE role = 'seller'").n,
    pendingShops: stat("SELECT COUNT(*) AS n FROM shops WHERE status = 'pending'").n,
    products: stat("SELECT COUNT(*) AS n FROM products WHERE status = 'active'").n,
    moderationProducts: stat("SELECT COUNT(*) AS n FROM products WHERE status = 'moderation'").n,
    orders: stat('SELECT COUNT(*) AS n FROM orders').n,
    revenue: stat("SELECT COALESCE(SUM(total), 0) AS s FROM orders WHERE status != 'cancelled'").s,
    todayOrders: stat("SELECT COUNT(*) AS n FROM orders WHERE date(created_at) = date('now')").n,
  };

  const daily = db
    .prepare(
      `SELECT date(created_at) AS day, COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
       FROM orders WHERE status != 'cancelled' AND created_at >= date('now', '-13 days')
       GROUP BY day ORDER BY day`
    )
    .all();

  const statusDist = db
    .prepare('SELECT status, COUNT(*) AS n FROM orders GROUP BY status')
    .all()
    .map((r) => ({ ...r, label: ORDER_STATUS_LABELS[r.status] }));

  const topShops = db
    .prepare(
      `SELECT s.id, s.name, COUNT(o.id) AS orders, COALESCE(SUM(o.total), 0) AS revenue
       FROM shops s LEFT JOIN orders o ON o.shop_id = s.id AND o.status != 'cancelled'
       WHERE s.status = 'approved' GROUP BY s.id ORDER BY revenue DESC LIMIT 5`
    )
    .all();

  res.json({ stats, daily, statusDist, topShops });
});

/* ---------- Foydalanuvchilar ---------- */

adminRouter.get('/users', (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { q, role } = req.query;
  const where = ['1=1'];
  const params = [];
  if (q) { where.push('(name LIKE ? OR email LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
  if (role) { where.push('role = ?'); params.push(role); }
  const whereSql = where.join(' AND ');
  const total = db.prepare(`SELECT COUNT(*) AS n FROM users WHERE ${whereSql}`).get(...params).n;
  const users = db
    .prepare(
      `SELECT id, name, email, phone, role, status, created_at FROM users
       WHERE ${whereSql} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);
  res.json({ users, total, page, pages: Math.ceil(total / limit) });
});

adminRouter.patch('/users/:id/status', (req, res) => {
  const { status } = req.body || {};
  if (!['active', 'blocked'].includes(status)) throw new ApiError(400, 'Holat noto‘g‘ri');
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) throw new ApiError(404, 'Foydalanuvchi topilmadi');
  if (user.role === 'admin') throw new ApiError(400, 'Adminni bloklab bo‘lmaydi');
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, user.id);
  res.json({ ok: true });
});

/* ---------- Do'konlar ---------- */

adminRouter.get('/shops', (req, res) => {
  const { status } = req.query;
  const where = status ? 'WHERE s.status = ?' : '';
  const params = status ? [status] : [];
  const shops = db
    .prepare(
      `SELECT s.*, u.name AS seller_name, u.email AS seller_email, u.phone AS seller_phone,
        (SELECT COUNT(*) FROM products p WHERE p.shop_id = s.id) AS product_count
       FROM shops s JOIN users u ON u.id = s.seller_id ${where} ORDER BY s.created_at DESC`
    )
    .all(...params);
  res.json({ shops });
});

adminRouter.patch('/shops/:id/status', (req, res) => {
  const { status } = req.body || {};
  if (!['pending', 'approved', 'blocked'].includes(status)) throw new ApiError(400, 'Holat noto‘g‘ri');
  const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(req.params.id);
  if (!shop) throw new ApiError(404, 'Do‘kon topilmadi');
  db.prepare('UPDATE shops SET status = ? WHERE id = ?').run(status, shop.id);
  const msg = { approved: 'Do‘koningiz tasdiqlandi 🎉', blocked: 'Do‘koningiz bloklandi', pending: 'Do‘koningiz qayta ko‘rib chiqilmoqda' };
  db.prepare('INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)').run(
    shop.seller_id, 'Do‘kon holati', msg[status], 'shop'
  );
  res.json({ ok: true });
});

/* ---------- Kategoriyalar ---------- */

adminRouter.get('/categories', (_req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort, name').all();
  res.json({ categories });
});

adminRouter.post('/categories', (req, res) => {
  const { name, parent_id = null, icon = null, image = null, sort = 0 } = req.body || {};
  if (!name || String(name).trim().length < 2) throw new ApiError(400, 'Kategoriya nomi kamida 2 ta belgi');
  const slug = String(name).trim().toLowerCase().replace(/['ʻ’`]/g, '').replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  const result = db
    .prepare('INSERT INTO categories (name, slug, parent_id, icon, image, sort) VALUES (?, ?, ?, ?, ?, ?)')
    .run(String(name).trim(), slug, parent_id, icon, image, sort);
  res.status(201).json({ category: db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid) });
});

adminRouter.patch('/categories/:id', (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) throw new ApiError(404, 'Kategoriya topilmadi');
  const { name, icon, image, sort, active, parent_id } = req.body || {};
  db.prepare(
    `UPDATE categories SET name = COALESCE(?, name), icon = COALESCE(?, icon), image = COALESCE(?, image),
     sort = COALESCE(?, sort), active = COALESCE(?, active), parent_id = COALESCE(?, parent_id) WHERE id = ?`
  ).run(name ?? null, icon ?? null, image ?? null, sort ?? null,
    active === undefined ? null : active ? 1 : 0, parent_id ?? null, cat.id);
  res.json({ category: db.prepare('SELECT * FROM categories WHERE id = ?').get(cat.id) });
});

adminRouter.delete('/categories/:id', (req, res) => {
  const used = db.prepare('SELECT COUNT(*) AS n FROM products WHERE category_id = ?').get(req.params.id).n;
  if (used > 0) throw new ApiError(400, 'Bu kategoriyada mahsulotlar bor — avval ularni ko‘chiring');
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- Mahsulot moderatsiyasi ---------- */

adminRouter.get('/products', (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { status, q } = req.query;
  const where = ['1=1'];
  const params = [];
  if (status) { where.push('p.status = ?'); params.push(status); }
  if (q) { where.push('p.name LIKE ?'); params.push(`%${q}%`); }
  const whereSql = where.join(' AND ');
  const total = db.prepare(`SELECT COUNT(*) AS n FROM products p WHERE ${whereSql}`).get(...params).n;
  const rows = db
    .prepare(
      `SELECT p.*, s.name AS shop_name FROM products p JOIN shops s ON s.id = p.shop_id
       WHERE ${whereSql} ORDER BY p.created_at DESC, p.id DESC LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);
  res.json({ products: rows.map(serializeProduct), total, page, pages: Math.ceil(total / limit) });
});

adminRouter.patch('/products/:id/moderate', (req, res) => {
  const { action, reason = '' } = req.body || {};
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) throw new ApiError(404, 'Mahsulot topilmadi');
  if (!['approve', 'reject'].includes(action)) throw new ApiError(400, 'Amal noto‘g‘ri');

  const status = action === 'approve' ? 'active' : 'rejected';
  db.prepare('UPDATE products SET status = ?, reject_reason = ? WHERE id = ?').run(
    status, action === 'reject' ? String(reason).slice(0, 500) : null, product.id
  );
  const seller = db.prepare('SELECT seller_id FROM shops WHERE id = ?').get(product.shop_id);
  db.prepare('INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)').run(
    seller.seller_id,
    action === 'approve' ? 'Mahsulot tasdiqlandi' : 'Mahsulot rad etildi',
    action === 'approve' ? `"${product.name}" sotuvga chiqdi` : `"${product.name}" rad etildi. ${reason}`,
    'product'
  );
  res.json({ ok: true });
});

/* ---------- Buyurtmalar ---------- */

adminRouter.get('/orders', (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { status } = req.query;
  const where = status ? 'WHERE o.status = ?' : '';
  const params = status ? [status] : [];
  const total = db.prepare(`SELECT COUNT(*) AS n FROM orders o ${where}`).get(...params).n;
  const orders = db
    .prepare(
      `SELECT o.*, u.name AS buyer_name, s.name AS shop_name FROM orders o
       JOIN users u ON u.id = o.user_id JOIN shops s ON s.id = o.shop_id
       ${where} ORDER BY o.created_at DESC, o.id DESC LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset)
    .map((o) => ({
      ...o,
      address: JSON.parse(o.address),
      status_label: ORDER_STATUS_LABELS[o.status],
      items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id),
    }));
  res.json({ orders, total, page, pages: Math.ceil(total / limit) });
});

/* ---------- Bannerlar ---------- */

adminRouter.get('/banners', (_req, res) => {
  res.json({ banners: db.prepare('SELECT * FROM banners ORDER BY sort, id').all() });
});

adminRouter.post('/banners', (req, res) => {
  const { title, image, link_type = 'none', link_id = null, sort = 0 } = req.body || {};
  if (!title || !image) throw new ApiError(400, 'Sarlavha va rasm majburiy');
  const result = db
    .prepare('INSERT INTO banners (title, image, link_type, link_id, sort) VALUES (?, ?, ?, ?, ?)')
    .run(title, image, link_type, link_id, sort);
  res.status(201).json({ banner: db.prepare('SELECT * FROM banners WHERE id = ?').get(result.lastInsertRowid) });
});

adminRouter.patch('/banners/:id', (req, res) => {
  const banner = db.prepare('SELECT * FROM banners WHERE id = ?').get(req.params.id);
  if (!banner) throw new ApiError(404, 'Banner topilmadi');
  const { title, image, link_type, link_id, sort, active } = req.body || {};
  db.prepare(
    `UPDATE banners SET title = COALESCE(?, title), image = COALESCE(?, image),
     link_type = COALESCE(?, link_type), link_id = COALESCE(?, link_id),
     sort = COALESCE(?, sort), active = COALESCE(?, active) WHERE id = ?`
  ).run(title ?? null, image ?? null, link_type ?? null, link_id ?? null, sort ?? null,
    active === undefined ? null : active ? 1 : 0, banner.id);
  res.json({ banner: db.prepare('SELECT * FROM banners WHERE id = ?').get(banner.id) });
});

adminRouter.delete('/banners/:id', (req, res) => {
  db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- Kuponlar ---------- */

adminRouter.get('/coupons', (_req, res) => {
  res.json({ coupons: db.prepare('SELECT * FROM coupons ORDER BY id DESC').all() });
});

adminRouter.post('/coupons', (req, res) => {
  const { code, type, value, min_total = 0, expires_at = null } = req.body || {};
  if (!code || String(code).trim().length < 3) throw new ApiError(400, 'Kod kamida 3 ta belgi');
  if (!['percent', 'fixed'].includes(type)) throw new ApiError(400, 'Tur noto‘g‘ri');
  const v = parseInt(value, 10);
  if (!v || v <= 0 || (type === 'percent' && v > 90)) throw new ApiError(400, 'Qiymat noto‘g‘ri');
  const exists = db.prepare('SELECT id FROM coupons WHERE code = ?').get(String(code).trim());
  if (exists) throw new ApiError(409, 'Bu kod allaqachon mavjud');
  const result = db
    .prepare('INSERT INTO coupons (code, type, value, min_total, expires_at) VALUES (?, ?, ?, ?, ?)')
    .run(String(code).trim().toUpperCase(), type, v, parseInt(min_total, 10) || 0, expires_at);
  res.status(201).json({ coupon: db.prepare('SELECT * FROM coupons WHERE id = ?').get(result.lastInsertRowid) });
});

adminRouter.patch('/coupons/:id', (req, res) => {
  const coupon = db.prepare('SELECT * FROM coupons WHERE id = ?').get(req.params.id);
  if (!coupon) throw new ApiError(404, 'Kupon topilmadi');
  const { active } = req.body || {};
  db.prepare('UPDATE coupons SET active = COALESCE(?, active) WHERE id = ?').run(
    active === undefined ? null : active ? 1 : 0, coupon.id
  );
  res.json({ coupon: db.prepare('SELECT * FROM coupons WHERE id = ?').get(coupon.id) });
});

adminRouter.delete('/coupons/:id', (req, res) => {
  db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});
