import { Router } from 'express';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { serializeProduct, ApiError, ORDER_STATUS_LABELS } from '../utils/helpers.js';
import { config } from '../config.js';

export const orderRouter = Router();
orderRouter.use(requireAuth);

function validateCoupon(code, subtotal) {
  if (!code) return null;
  const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(String(code).trim());
  if (!coupon) throw new ApiError(400, 'Promokod topilmadi');
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
    throw new ApiError(400, 'Promokod muddati tugagan');
  if (subtotal < coupon.min_total)
    throw new ApiError(400, `Promokod kamida ${coupon.min_total.toLocaleString()} so‘mlik xarid uchun amal qiladi`);
  return coupon;
}

function couponDiscount(coupon, amount) {
  if (!coupon) return 0;
  return coupon.type === 'percent'
    ? Math.round((amount * coupon.value) / 100)
    : Math.min(coupon.value, amount);
}

/** Promokodni tekshirish */
orderRouter.post('/validate-coupon', (req, res) => {
  const { code, subtotal = 0 } = req.body || {};
  const coupon = validateCoupon(code, Number(subtotal));
  res.json({ coupon, discount: couponDiscount(coupon, Number(subtotal)) });
});

function serializeOrder(order) {
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  const history = db
    .prepare('SELECT status, note, created_at FROM order_status_history WHERE order_id = ? ORDER BY id')
    .all(order.id);
  const shop = db.prepare('SELECT id, name, logo FROM shops WHERE id = ?').get(order.shop_id);
  return {
    ...order,
    address: JSON.parse(order.address),
    status_label: ORDER_STATUS_LABELS[order.status],
    items,
    history,
    shop,
  };
}

/** Buyurtma yaratish — savat do'konlar bo'yicha alohida buyurtmalarga bo'linadi */
orderRouter.post('/', (req, res) => {
  const { address_id, payment_method = 'cash', coupon_code } = req.body || {};
  if (!['cash', 'card'].includes(payment_method)) throw new ApiError(400, 'To‘lov usuli noto‘g‘ri');

  const address = db
    .prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?')
    .get(address_id, req.user.id);
  if (!address) throw new ApiError(400, 'Yetkazish manzilini tanlang');

  const cartRows = db
    .prepare(
      `SELECT ci.qty, p.* FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ? AND p.status = 'active'`
    )
    .all(req.user.id);
  if (cartRows.length === 0) throw new ApiError(400, 'Savat bo‘sh');

  for (const row of cartRows) {
    if (row.stock < row.qty)
      throw new ApiError(400, `"${row.name}" mahsulotidan omborda faqat ${row.stock} dona qolgan`);
  }

  const cartSubtotal = cartRows.reduce((s, r) => s + r.price * r.qty, 0);
  const coupon = validateCoupon(coupon_code, cartSubtotal);
  const totalDiscount = couponDiscount(coupon, cartSubtotal);

  // Do'kon bo'yicha guruhlash — har bir do'konga alohida buyurtma
  const byShop = new Map();
  for (const row of cartRows) {
    if (!byShop.has(row.shop_id)) byShop.set(row.shop_id, []);
    byShop.get(row.shop_id).push(row);
  }

  const addressSnapshot = JSON.stringify({
    label: address.label,
    region: address.region,
    city: address.city,
    street: address.street,
    phone: address.phone,
  });

  const tx = db.transaction(() => {
    const orderIds = [];
    for (const [shopId, rows] of byShop) {
      const subtotal = rows.reduce((s, r) => s + r.price * r.qty, 0);
      // chegirma do'konlar o'rtasida ulushga qarab taqsimlanadi
      const discount = Math.round((totalDiscount * subtotal) / cartSubtotal);
      const shipping = subtotal >= config.freeShippingFrom ? 0 : config.shippingFee;
      const total = Math.max(0, subtotal - discount) + shipping;

      const result = db
        .prepare(
          `INSERT INTO orders (user_id, shop_id, address, payment_method, payment_status,
            subtotal, shipping_fee, discount, coupon_code, total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          req.user.id, shopId, addressSnapshot, payment_method,
          payment_method === 'card' ? 'paid' : 'pending',
          subtotal, shipping, discount, coupon ? coupon.code : null, total
        );
      const orderId = result.lastInsertRowid;
      orderIds.push(orderId);

      db.prepare('INSERT INTO order_status_history (order_id, status, note) VALUES (?, ?, ?)').run(
        orderId, 'pending', 'Buyurtma qabul qilindi'
      );

      for (const row of rows) {
        const images = JSON.parse(row.images || '[]');
        db.prepare(
          'INSERT INTO order_items (order_id, product_id, name, price, qty, image) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(orderId, row.id, row.name, row.price, row.qty, images[0] || null);
        db.prepare('UPDATE products SET stock = stock - ?, sold_count = sold_count + ? WHERE id = ?').run(
          row.qty, row.qty, row.id
        );
      }

      const seller = db.prepare('SELECT seller_id FROM shops WHERE id = ?').get(shopId);
      db.prepare('INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)').run(
        seller.seller_id, 'Yangi buyurtma', `#${orderId} raqamli yangi buyurtma keldi`, 'order'
      );
    }
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    return orderIds;
  });

  const orderIds = tx();
  const orders = orderIds.map((id) =>
    serializeOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(id))
  );
  res.status(201).json({ orders });
});

/** Buyurtmalarim */
orderRouter.get('/', (req, res) => {
  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC')
    .all(req.user.id);
  res.json({ orders: orders.map(serializeOrder) });
});

/** Bitta buyurtma */
orderRouter.get('/:id', (req, res) => {
  const order = db
    .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!order) throw new ApiError(404, 'Buyurtma topilmadi');
  res.json({ order: serializeOrder(order) });
});

/** Buyurtmani bekor qilish (faqat pending/confirmed holatida) */
orderRouter.post('/:id/cancel', (req, res) => {
  const order = db
    .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!order) throw new ApiError(404, 'Buyurtma topilmadi');
  if (!['pending', 'confirmed'].includes(order.status))
    throw new ApiError(400, 'Bu bosqichda buyurtmani bekor qilib bo‘lmaydi');

  const tx = db.transaction(() => {
    db.prepare("UPDATE orders SET status = 'cancelled', payment_status = CASE WHEN payment_status = 'paid' THEN 'refunded' ELSE payment_status END WHERE id = ?").run(order.id);
    db.prepare('INSERT INTO order_status_history (order_id, status, note) VALUES (?, ?, ?)').run(
      order.id, 'cancelled', 'Haridor tomonidan bekor qilindi'
    );
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    for (const it of items) {
      db.prepare('UPDATE products SET stock = stock + ?, sold_count = MAX(0, sold_count - ?) WHERE id = ?').run(
        it.qty, it.qty, it.product_id
      );
    }
  });
  tx();
  res.json({ order: serializeOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id)) });
});

/** Yetkazilgan buyurtma mahsulotiga sharh qoldirish */
orderRouter.post('/:id/review', (req, res) => {
  const { product_id, rating, comment = '' } = req.body || {};
  const r = parseInt(rating, 10);
  if (!r || r < 1 || r > 5) throw new ApiError(400, 'Baho 1 dan 5 gacha bo‘lishi kerak');

  const order = db
    .prepare("SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = 'delivered'")
    .get(req.params.id, req.user.id);
  if (!order) throw new ApiError(400, 'Faqat yetkazilgan buyurtma mahsulotini baholash mumkin');

  const item = db
    .prepare('SELECT * FROM order_items WHERE order_id = ? AND product_id = ?')
    .get(order.id, product_id);
  if (!item) throw new ApiError(400, 'Bu mahsulot ushbu buyurtmada yo‘q');

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO reviews (product_id, user_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, product_id) DO UPDATE SET rating = excluded.rating, comment = excluded.comment, created_at = datetime('now')`
    ).run(product_id, req.user.id, order.id, r, String(comment).slice(0, 2000));
    const agg = db
      .prepare('SELECT AVG(rating) AS avg, COUNT(*) AS n FROM reviews WHERE product_id = ?')
      .get(product_id);
    db.prepare('UPDATE products SET rating = ?, rating_count = ? WHERE id = ?').run(
      Math.round(agg.avg * 10) / 10, agg.n, product_id
    );
  });
  tx();
  res.status(201).json({ ok: true });
});
