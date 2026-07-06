import { Router } from 'express';
import { db } from '../db/connection.js';
import { serializeProduct, getPagination, ApiError } from '../utils/helpers.js';

export const catalogRouter = Router();

/** Kategoriyalar daraxti */
catalogRouter.get('/categories', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM categories WHERE active = 1 ORDER BY sort, name')
    .all();
  const byParent = new Map();
  for (const c of rows) {
    const key = c.parent_id || 0;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(c);
  }
  const build = (parentId) =>
    (byParent.get(parentId) || []).map((c) => ({ ...c, children: build(c.id) }));
  res.json({ categories: build(0) });
});

/**
 * Mahsulotlar ro'yxati — qidiruv, filtr, saralash, sahifalash
 * ?q= &category= &shop= &min_price= &max_price= &sort=new|price_asc|price_desc|popular|rating&page=&limit=
 */
catalogRouter.get('/products', (req, res) => {
  const { q, category, shop, min_price, max_price, ids, sort = 'new' } = req.query;
  const { page, limit, offset } = getPagination(req.query);

  const where = ["p.status = 'active'", "s.status = 'approved'"];
  const params = [];

  if (q) {
    where.push('(p.name LIKE ? OR p.name_ru LIKE ? OR p.description LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (ids) {
    // oxirgi ko'rilganlar uchun: ?ids=1,2,3 (ko'pi bilan 20 ta)
    const list = String(ids).split(',').map((n) => parseInt(n, 10)).filter(Boolean).slice(0, 20);
    if (list.length) {
      where.push(`p.id IN (${list.map(() => '?').join(',')})`);
      params.push(...list);
    }
  }
  if (category) {
    // tanlangan kategoriya va uning bolalari
    where.push('p.category_id IN (SELECT id FROM categories WHERE id = ? OR parent_id = ?)');
    params.push(Number(category), Number(category));
  }
  if (shop) {
    where.push('p.shop_id = ?');
    params.push(Number(shop));
  }
  if (min_price) {
    where.push('p.price >= ?');
    params.push(Number(min_price));
  }
  if (max_price) {
    where.push('p.price <= ?');
    params.push(Number(max_price));
  }

  const sortSql = {
    new: 'p.created_at DESC, p.id DESC',
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    popular: 'p.sold_count DESC, p.rating DESC',
    rating: 'p.rating DESC, p.rating_count DESC',
    discount: '(CASE WHEN p.old_price > p.price THEN 1.0 - CAST(p.price AS REAL)/p.old_price ELSE 0 END) DESC',
  }[sort] || 'p.created_at DESC, p.id DESC';

  const whereSql = where.join(' AND ');
  const total = db
    .prepare(`SELECT COUNT(*) AS n FROM products p JOIN shops s ON s.id = p.shop_id WHERE ${whereSql}`)
    .get(...params).n;
  const rows = db
    .prepare(
      `SELECT p.*, s.name AS shop_name
       FROM products p JOIN shops s ON s.id = p.shop_id
       WHERE ${whereSql} ORDER BY ${sortSql} LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);

  res.json({
    products: rows.map(serializeProduct),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

/** Bitta mahsulot */
catalogRouter.get('/products/:id', (req, res) => {
  const row = db
    .prepare(
      `SELECT p.*, s.name AS shop_name, s.logo AS shop_logo, s.rating AS shop_rating
       FROM products p JOIN shops s ON s.id = p.shop_id WHERE p.id = ?`
    )
    .get(req.params.id);
  if (!row || row.status !== 'active') throw new ApiError(404, 'Mahsulot topilmadi');

  const similar = db
    .prepare(
      `SELECT p.* FROM products p JOIN shops s ON s.id = p.shop_id
       WHERE p.category_id = ? AND p.id != ? AND p.status = 'active' AND s.status = 'approved'
       ORDER BY p.sold_count DESC LIMIT 8`
    )
    .all(row.category_id, row.id);

  res.json({ product: serializeProduct(row), similar: similar.map(serializeProduct) });
});

/** Mahsulot sharhlari */
catalogRouter.get('/products/:id/reviews', (req, res) => {
  const { page, limit, offset } = getPagination(req.query, 10);
  const total = db.prepare('SELECT COUNT(*) AS n FROM reviews WHERE product_id = ?').get(req.params.id).n;
  const reviews = db
    .prepare(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name, u.avatar AS user_avatar
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT ? OFFSET ?`
    )
    .all(req.params.id, limit, offset);
  const dist = db
    .prepare('SELECT rating, COUNT(*) AS n FROM reviews WHERE product_id = ? GROUP BY rating')
    .all(req.params.id);
  res.json({ reviews, total, page, pages: Math.ceil(total / limit), distribution: dist });
});

/** Faol bannerlar */
catalogRouter.get('/banners', (_req, res) => {
  const banners = db
    .prepare('SELECT * FROM banners WHERE active = 1 ORDER BY sort, id')
    .all();
  res.json({ banners });
});

/** Do'kon sahifasi */
catalogRouter.get('/shops/:id', (req, res) => {
  const shop = db
    .prepare("SELECT id, name, description, logo, rating, created_at FROM shops WHERE id = ? AND status = 'approved'")
    .get(req.params.id);
  if (!shop) throw new ApiError(404, 'Do‘kon topilmadi');
  const productCount = db
    .prepare("SELECT COUNT(*) AS n FROM products WHERE shop_id = ? AND status = 'active'")
    .get(shop.id).n;
  res.json({ shop: { ...shop, product_count: productCount } });
});
