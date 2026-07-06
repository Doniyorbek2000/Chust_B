import { Router } from 'express';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { serializeProduct, ApiError } from '../utils/helpers.js';
import { config } from '../config.js';

export const cartRouter = Router();
cartRouter.use(requireAuth);

function getCart(userId) {
  const rows = db
    .prepare(
      `SELECT ci.id AS cart_item_id, ci.qty, p.*, s.name AS shop_name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       JOIN shops s ON s.id = p.shop_id
       WHERE ci.user_id = ? ORDER BY ci.id DESC`
    )
    .all(userId);
  const items = rows.map((r) => {
    const { cart_item_id, qty, ...productRow } = r;
    const product = serializeProduct(productRow);
    return {
      id: cart_item_id,
      qty,
      product,
      available: product.status === 'active' && product.stock > 0,
      line_total: product.price * qty,
    };
  });
  const subtotal = items.filter((i) => i.available).reduce((s, i) => s + i.line_total, 0);
  const shipping = subtotal === 0 || subtotal >= config.freeShippingFrom ? 0 : config.shippingFee;
  return { items, subtotal, shipping_fee: shipping, total: subtotal + shipping };
}

cartRouter.get('/', (req, res) => res.json(getCart(req.user.id)));

/** Savatga qo'shish yoki miqdorni oshirish */
cartRouter.post('/', (req, res) => {
  const { product_id, qty = 1 } = req.body || {};
  const n = Math.max(1, parseInt(qty, 10) || 1);
  const product = db.prepare("SELECT * FROM products WHERE id = ? AND status = 'active'").get(product_id);
  if (!product) throw new ApiError(404, 'Mahsulot topilmadi');
  if (product.stock < 1) throw new ApiError(400, 'Mahsulot omborda qolmagan');

  const existing = db
    .prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?')
    .get(req.user.id, product_id);
  const newQty = Math.min(product.stock, (existing?.qty || 0) + n);
  if (existing) {
    db.prepare('UPDATE cart_items SET qty = ? WHERE id = ?').run(newQty, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, qty) VALUES (?, ?, ?)').run(
      req.user.id,
      product_id,
      newQty
    );
  }
  res.status(201).json(getCart(req.user.id));
});

/** Miqdorni o'zgartirish */
cartRouter.patch('/:itemId', (req, res) => {
  const item = db
    .prepare('SELECT ci.*, p.stock FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.id = ? AND ci.user_id = ?')
    .get(req.params.itemId, req.user.id);
  if (!item) throw new ApiError(404, 'Savat elementi topilmadi');
  const qty = parseInt(req.body?.qty, 10);
  if (!qty || qty < 1) throw new ApiError(400, 'Miqdor noto‘g‘ri');
  db.prepare('UPDATE cart_items SET qty = ? WHERE id = ?').run(Math.min(qty, item.stock), item.id);
  res.json(getCart(req.user.id));
});

/** Elementni o'chirish */
cartRouter.delete('/:itemId', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.itemId, req.user.id);
  res.json(getCart(req.user.id));
});

/** Savatni tozalash */
cartRouter.delete('/', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json(getCart(req.user.id));
});

export { getCart };
