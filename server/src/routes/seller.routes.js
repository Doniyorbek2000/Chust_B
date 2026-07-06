import { Router } from 'express';
import { db } from '../db/connection.js';
import { requireAuth, requireRole, loadShop } from '../middleware/auth.js';
import {
  serializeProduct, getPagination, ApiError, ORDER_STATUSES, ORDER_STATUS_LABELS,
} from '../utils/helpers.js';

export const sellerRouter = Router();
sellerRouter.use(requireAuth, requireRole('seller'), loadShop);

/** Do'kon dashboardi — statistika */
sellerRouter.get('/dashboard', (req, res) => {
  const shopId = req.shop.id;
  const stat = (sql, ...p) => db.prepare(sql).get(...p);

  const products = stat("SELECT COUNT(*) AS n FROM products WHERE shop_id = ? AND status != 'archived'", shopId).n;
  const activeProducts = stat("SELECT COUNT(*) AS n FROM products WHERE shop_id = ? AND status = 'active'", shopId).n;
  const orders = stat('SELECT COUNT(*) AS n FROM orders WHERE shop_id = ?', shopId).n;
  const pendingOrders = stat("SELECT COUNT(*) AS n FROM orders WHERE shop_id = ? AND status = 'pending'", shopId).n;
  const revenue = stat(
    "SELECT COALESCE(SUM(total), 0) AS s FROM orders WHERE shop_id = ? AND status != 'cancelled'", shopId
  ).s;
  const todayRevenue = stat(
    "SELECT COALESCE(SUM(total), 0) AS s FROM orders WHERE shop_id = ? AND status != 'cancelled' AND date(created_at) = date('now')",
    shopId
  ).s;

  // oxirgi 14 kunlik savdo grafigi
  const daily = db
    .prepare(
      `SELECT date(created_at) AS day, COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
       FROM orders WHERE shop_id = ? AND status != 'cancelled' AND created_at >= date('now', '-13 days')
       GROUP BY day ORDER BY day`
    )
    .all(shopId);

  const topProducts = db
    .prepare(
      `SELECT p.id, p.name, p.images, p.price, p.sold_count, p.stock, p.rating
       FROM products p WHERE p.shop_id = ? ORDER BY p.sold_count DESC LIMIT 5`
    )
    .all(shopId)
    .map(serializeProduct);

  const lowStock = db
    .prepare(
      "SELECT id, name, stock FROM products WHERE shop_id = ? AND status = 'active' AND stock <= 5 ORDER BY stock LIMIT 10"
    )
    .all(shopId);

  res.json({
    shop: req.shop,
    stats: { products, activeProducts, orders, pendingOrders, revenue, todayRevenue },
    daily, topProducts, lowStock,
  });
});

/* ---------- Mahsulotlar ---------- */

sellerRouter.get('/products', (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { q, status } = req.query;
  const where = ['shop_id = ?'];
  const params = [req.shop.id];
  if (q) { where.push('name LIKE ?'); params.push(`%${q}%`); }
  if (status) { where.push('status = ?'); params.push(status); }
  const whereSql = where.join(' AND ');
  const total = db.prepare(`SELECT COUNT(*) AS n FROM products WHERE ${whereSql}`).get(...params).n;
  const rows = db
    .prepare(`SELECT * FROM products WHERE ${whereSql} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);
  res.json({ products: rows.map(serializeProduct), total, page, pages: Math.ceil(total / limit) });
});

function validateProductBody(body) {
  const { name, category_id, price, old_price, stock, description = '', images = [], attributes = {} } = body || {};
  if (!name || String(name).trim().length < 3) throw new ApiError(400, 'Mahsulot nomi kamida 3 ta belgi');
  const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
  if (!cat) throw new ApiError(400, 'Kategoriya tanlanmagan yoki mavjud emas');
  const p = parseInt(price, 10);
  if (!p || p <= 0) throw new ApiError(400, 'Narx musbat son bo‘lishi kerak');
  const op = old_price ? parseInt(old_price, 10) : null;
  if (op !== null && op <= p) throw new ApiError(400, 'Eski narx joriy narxdan katta bo‘lishi kerak');
  const s = parseInt(stock, 10);
  if (Number.isNaN(s) || s < 0) throw new ApiError(400, 'Ombor miqdori noto‘g‘ri');
  if (!Array.isArray(images)) throw new ApiError(400, 'Rasmlar massiv bo‘lishi kerak');
  return {
    name: String(name).trim(),
    category_id: cat.id,
    price: p,
    old_price: op,
    stock: s,
    description: String(description).slice(0, 10000),
    images: JSON.stringify(images.slice(0, 10)),
    attributes: JSON.stringify(attributes || {}),
  };
}

sellerRouter.post('/products', (req, res) => {
  if (req.shop.status !== 'approved')
    throw new ApiError(403, 'Do‘kon hali admin tomonidan tasdiqlanmagan');
  const v = validateProductBody(req.body);
  const result = db
    .prepare(
      `INSERT INTO products (shop_id, category_id, name, description, price, old_price, stock, images, attributes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'moderation')`
    )
    .run(req.shop.id, v.category_id, v.name, v.description, v.price, v.old_price, v.stock, v.images, v.attributes);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ product: serializeProduct(product) });
});

sellerRouter.patch('/products/:id', (req, res) => {
  const product = db
    .prepare('SELECT * FROM products WHERE id = ? AND shop_id = ?')
    .get(req.params.id, req.shop.id);
  if (!product) throw new ApiError(404, 'Mahsulot topilmadi');
  const v = validateProductBody({ ...serializeProduct(product), ...req.body });
  // narx/nom/tavsif o'zgarsa qayta moderatsiyaga tushmaydi — faqat yangi mahsulotlar tekshiriladi
  const status = req.body.status === 'archived' ? 'archived'
    : product.status === 'archived' && req.body.status === 'active' ? 'moderation'
    : product.status;
  db.prepare(
    `UPDATE products SET name = ?, description = ?, category_id = ?, price = ?, old_price = ?,
     stock = ?, images = ?, attributes = ?, status = ? WHERE id = ?`
  ).run(v.name, v.description, v.category_id, v.price, v.old_price, v.stock, v.images, v.attributes, status, product.id);
  res.json({ product: serializeProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(product.id)) });
});

sellerRouter.delete('/products/:id', (req, res) => {
  const product = db
    .prepare('SELECT id FROM products WHERE id = ? AND shop_id = ?')
    .get(req.params.id, req.shop.id);
  if (!product) throw new ApiError(404, 'Mahsulot topilmadi');
  // buyurtmalar tarixini saqlash uchun o'chirmasdan arxivlaymiz
  db.prepare("UPDATE products SET status = 'archived' WHERE id = ?").run(product.id);
  res.json({ ok: true });
});

/* ---------- Buyurtmalar ---------- */

sellerRouter.get('/orders', (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { status } = req.query;
  const where = ['o.shop_id = ?'];
  const params = [req.shop.id];
  if (status) { where.push('o.status = ?'); params.push(status); }
  const whereSql = where.join(' AND ');
  const total = db.prepare(`SELECT COUNT(*) AS n FROM orders o WHERE ${whereSql}`).get(...params).n;
  const orders = db
    .prepare(
      `SELECT o.*, u.name AS buyer_name, u.phone AS buyer_phone FROM orders o
       JOIN users u ON u.id = o.user_id WHERE ${whereSql}
       ORDER BY o.created_at DESC, o.id DESC LIMIT ? OFFSET ?`
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

/** Buyurtma holatini yangilash: pending→confirmed→shipped→delivered yoki cancelled */
sellerRouter.patch('/orders/:id/status', (req, res) => {
  const order = db
    .prepare('SELECT * FROM orders WHERE id = ? AND shop_id = ?')
    .get(req.params.id, req.shop.id);
  if (!order) throw new ApiError(404, 'Buyurtma topilmadi');

  const { status, note = '' } = req.body || {};
  if (!ORDER_STATUSES.includes(status)) throw new ApiError(400, 'Holat noto‘g‘ri');

  const allowed = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };
  if (!allowed[order.status].includes(status))
    throw new ApiError(400, `"${ORDER_STATUS_LABELS[order.status]}" holatidan "${ORDER_STATUS_LABELS[status]}" holatiga o‘tib bo‘lmaydi`);

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE orders SET status = ?,
       payment_status = CASE
         WHEN ? = 'delivered' AND payment_method = 'cash' THEN 'paid'
         WHEN ? = 'cancelled' AND payment_status = 'paid' THEN 'refunded'
         ELSE payment_status END
       WHERE id = ?`
    ).run(status, status, status, order.id);
    db.prepare('INSERT INTO order_status_history (order_id, status, note) VALUES (?, ?, ?)').run(
      order.id, status, note
    );
    if (status === 'cancelled') {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      for (const it of items) {
        db.prepare('UPDATE products SET stock = stock + ?, sold_count = MAX(0, sold_count - ?) WHERE id = ?').run(
          it.qty, it.qty, it.product_id
        );
      }
    }
    db.prepare('INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)').run(
      order.user_id,
      'Buyurtma holati yangilandi',
      `#${order.id} buyurtmangiz: ${ORDER_STATUS_LABELS[status]}`,
      'order'
    );
  });
  tx();

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
  res.json({
    order: {
      ...updated,
      address: JSON.parse(updated.address),
      status_label: ORDER_STATUS_LABELS[updated.status],
      items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(updated.id),
    },
  });
});

/* ---------- Do'kon sozlamalari ---------- */

sellerRouter.patch('/shop', (req, res) => {
  const { name, description, logo } = req.body || {};
  if (name !== undefined && String(name).trim().length < 2)
    throw new ApiError(400, 'Do‘kon nomi kamida 2 ta belgi');
  db.prepare(
    'UPDATE shops SET name = COALESCE(?, name), description = COALESCE(?, description), logo = COALESCE(?, logo) WHERE id = ?'
  ).run(name !== undefined ? String(name).trim() : null, description ?? null, logo ?? null, req.shop.id);
  res.json({ shop: db.prepare('SELECT * FROM shops WHERE id = ?').get(req.shop.id) });
});
