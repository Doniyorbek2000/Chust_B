/**
 * Demo ma'lumotlar: admin, sotuvchilar, haridor, kategoriyalar,
 * mahsulotlar, bannerlar, kuponlar, buyurtmalar va sharhlar.
 * Ishga tushirish: npm run seed
 */
import bcrypt from 'bcryptjs';
import { db } from './connection.js';

const count = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
if (count > 0) {
  console.log('ℹ️  Baza bo‘sh emas — seed o‘tkazib yuborildi. Qayta seed uchun server/data papkasini o‘chiring.');
  process.exit(0);
}

const hash = bcrypt.hashSync('123456', 10);
const img = (seed, w = 640, h = 640) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const seed = db.transaction(() => {
  /* --- Foydalanuvchilar --- */
  const insertUser = db.prepare(
    'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  );
  const adminId = insertUser.run('Bosh admin', 'admin@admbozor.uz', '+998901112233', hash, 'admin').lastInsertRowid;
  const seller1 = insertUser.run('Akmal Karimov', 'texno@admbozor.uz', '+998902223344', hash, 'seller').lastInsertRowid;
  const seller2 = insertUser.run('Dilnoza Rahimova', 'moda@admbozor.uz', '+998903334455', hash, 'seller').lastInsertRowid;
  const buyerId = insertUser.run('Jasur Toshmatov', 'haridor@admbozor.uz', '+998904445566', hash, 'buyer').lastInsertRowid;

  /* --- Do'konlar --- */
  const insertShop = db.prepare(
    "INSERT INTO shops (seller_id, name, description, logo, status, rating) VALUES (?, ?, ?, ?, 'approved', ?)"
  );
  const shop1 = insertShop.run(seller1, 'TexnoOlam', 'Original texnika va gadjetlar — rasmiy kafolat bilan', img('shop-texno', 200, 200), 4.8).lastInsertRowid;
  const shop2 = insertShop.run(seller2, 'ModaLine', 'Zamonaviy kiyim-kechak va aksessuarlar', img('shop-moda', 200, 200), 4.6).lastInsertRowid;

  /* --- Kategoriyalar --- */
  const insertCat = db.prepare(
    'INSERT INTO categories (name, slug, parent_id, icon, image, sort) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const cats = {};
  const catDefs = [
    ['Elektronika', 'elektronika', '📱'],
    ['Kiyim-kechak', 'kiyim', '👕'],
    ['Uy-ro‘zg‘or', 'uy', '🏠'],
    ['Go‘zallik', 'gozallik', '💄'],
    ['Sport', 'sport', '⚽'],
    ['Bolalar uchun', 'bolalar', '🧸'],
    ['Oziq-ovqat', 'oziq-ovqat', '🍎'],
    ['Kitoblar', 'kitoblar', '📚'],
  ];
  catDefs.forEach(([name, slug, icon], i) => {
    cats[slug] = insertCat.run(name, slug, null, icon, img(`cat-${slug}`, 400, 300), i).lastInsertRowid;
  });
  cats.telefon = insertCat.run('Smartfonlar', 'smartfonlar', cats.elektronika, '📱', null, 0).lastInsertRowid;
  cats.noutbuk = insertCat.run('Noutbuklar', 'noutbuklar', cats.elektronika, '💻', null, 1).lastInsertRowid;
  cats.quloqchin = insertCat.run('Quloqchinlar', 'quloqchinlar', cats.elektronika, '🎧', null, 2).lastInsertRowid;
  cats.erkak = insertCat.run('Erkaklar kiyimi', 'erkaklar', cats.kiyim, '👔', null, 0).lastInsertRowid;
  cats.ayol = insertCat.run('Ayollar kiyimi', 'ayollar', cats.kiyim, '👗', null, 1).lastInsertRowid;

  /* --- Mahsulotlar --- */
  const insertProduct = db.prepare(
    `INSERT INTO products (shop_id, category_id, name, description, price, old_price, stock,
      images, attributes, rating, rating_count, sold_count, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`
  );
  const P = (shop, cat, name, desc, price, oldPrice, stock, attrs, rating, rc, sold, imgSeed) =>
    insertProduct.run(
      shop, cat, name, desc, price, oldPrice, stock,
      JSON.stringify([img(imgSeed), img(imgSeed + '-2'), img(imgSeed + '-3')]),
      JSON.stringify(attrs), rating, rc, sold, // eslint-disable-line
    ).lastInsertRowid;

  const products = [];
  products.push(P(shop1, cats.telefon, 'Samsung Galaxy S24 Ultra 12/512GB', 'Eng so‘nggi flagman smartfon. 200MP kamera, S Pen, titan korpus, 5000 mAh batareya. Rasmiy kafolat 1 yil.', 14990000, 16500000, 15, { Xotira: '512 GB', RAM: '12 GB', Rang: 'Titan kulrang', Ekran: '6.8" QHD+' }, 4.9, 124, 340, 'galaxy-s24'));
  products.push(P(shop1, cats.telefon, 'iPhone 15 Pro Max 256GB', 'A17 Pro protsessor, titan dizayn, 48MP asosiy kamera, USB-C. Rasmiy kafolat.', 15490000, null, 8, { Xotira: '256 GB', Rang: 'Tabiiy titan', Ekran: '6.7" Super Retina' }, 4.8, 98, 215, 'iphone-15'));
  products.push(P(shop1, cats.telefon, 'Xiaomi Redmi Note 13 Pro 8/256GB', 'AMOLED 120Hz ekran, 200MP kamera, 67W tez quvvatlash. Hamyonbop flagman.', 3690000, 4200000, 42, { Xotira: '256 GB', RAM: '8 GB', Rang: 'Ko‘k' }, 4.7, 256, 890, 'redmi-13'));
  products.push(P(shop1, cats.noutbuk, 'MacBook Air 13" M3 8/256GB', 'Apple M3 chip, 18 soat batareya, Liquid Retina ekran. Yengil va kuchli.', 13990000, 14990000, 6, { Protsessor: 'Apple M3', RAM: '8 GB', SSD: '256 GB' }, 4.9, 67, 145, 'macbook-m3'));
  products.push(P(shop1, cats.noutbuk, 'Lenovo IdeaPad Slim 3 i5/16/512', 'Intel Core i5-12450H, 16GB RAM, 512GB SSD, 15.6" FHD. O‘qish va ish uchun ideal.', 6490000, 7200000, 20, { Protsessor: 'Intel i5-12450H', RAM: '16 GB', SSD: '512 GB' }, 4.5, 89, 310, 'lenovo-slim'));
  products.push(P(shop1, cats.quloqchin, 'AirPods Pro 2 (USB-C)', 'Faol shovqin kamaytirish, moslashuvchan audio, MagSafe quti.', 2890000, 3300000, 30, { Tur: 'TWS', Ulanish: 'Bluetooth 5.3' }, 4.8, 143, 520, 'airpods-pro'));
  products.push(P(shop1, cats.quloqchin, 'Sony WH-1000XM5', 'Bozordagi eng yaxshi shovqin kamaytirish. 30 soat batareya, Hi-Res audio.', 4190000, null, 12, { Tur: 'Ustki', Batareya: '30 soat' }, 4.9, 78, 190, 'sony-xm5'));
  products.push(P(shop1, cats.elektronika, 'Xiaomi Mi Smart Band 9', 'AMOLED ekran, 21 kunlik batareya, 150+ sport rejimi, suv o‘tkazmaydi.', 490000, 590000, 100, { Ekran: '1.62" AMOLED', Batareya: '21 kun' }, 4.6, 412, 1560, 'mi-band'));
  products.push(P(shop1, cats.uy, 'Xiaomi Robot Vacuum S12', 'Aqlli changyutgich — lazer navigatsiya, 4000Pa quvvat, ilova orqali boshqarish.', 2790000, 3400000, 9, { Quvvat: '4000 Pa', Batareya: '110 daqiqa' }, 4.7, 56, 130, 'robot-vacuum'));

  products.push(P(shop2, cats.erkak, 'Erkaklar klassik ko‘ylagi (oq)', '100% paxta, klassik kesim, dazmollash oson. O‘lchamlar: S–XXL.', 249000, 320000, 60, { Material: '100% paxta', Rang: 'Oq', Kesim: 'Klassik' }, 4.5, 87, 430, 'shirt-white'));
  products.push(P(shop2, cats.erkak, 'Jinsi shim slim-fit (to‘q ko‘k)', 'Zamonaviy slim-fit kesim, elastik denim, chidamli tikuv.', 329000, null, 45, { Material: 'Denim', Rang: 'To‘q ko‘k' }, 4.4, 63, 280, 'jeans-slim'));
  products.push(P(shop2, cats.ayol, 'Ayollar yozgi ko‘ylagi (gulli)', 'Yengil viskoza mato, romantik gulli naqsh, midi uzunlik.', 289000, 380000, 35, { Material: 'Viskoza', Uzunlik: 'Midi' }, 4.7, 112, 510, 'dress-floral'));
  products.push(P(shop2, cats.ayol, 'Ayollar charm sumkasi', 'Eko-charm, ichki cho‘ntaklar, yelka tasmasi. Rang: qora, jigarrang.', 419000, 520000, 25, { Material: 'Eko-charm', Rang: 'Qora' }, 4.6, 45, 160, 'bag-leather'));
  products.push(P(shop2, cats.sport, 'Yoga to‘shagi 6mm (TPE)', 'Sirpanmaydigan sirt, ekologik TPE material, ko‘tarish tasmasi bilan.', 159000, 210000, 80, { Qalinlik: '6 mm', Material: 'TPE' }, 4.5, 94, 370, 'yoga-mat'));
  products.push(P(shop2, cats.sport, 'Krossovka Running Pro (unisex)', 'Yengil amortizatsiya, nafas oluvchi mato, 36–45 o‘lchamlar.', 449000, 560000, 50, { Tur: 'Yugurish', Material: 'Mesh' }, 4.6, 138, 620, 'sneakers-run'));
  products.push(P(shop2, cats.bolalar, 'LEGO Classic 500 detal to‘plami', 'Ijodkorlik uchun 500 ta rangli detal. 4+ yosh.', 389000, null, 22, { Yosh: '4+', Detallar: '500' }, 4.9, 76, 240, 'lego-classic'));
  products.push(P(shop2, cats.bolalar, 'Bolalar velosipedi 16" (qizil)', 'Yordamchi g‘ildiraklar, zanjir himoyasi, qo‘ng‘iroq. 4–6 yosh uchun.', 890000, 1100000, 10, { Diametr: '16"', Yosh: '4–6' }, 4.7, 34, 95, 'kids-bike'));
  products.push(P(shop2, cats.gozallik, 'Parfyum to‘plami (3x30ml)', 'Kunduzgi, kechki va sport hidlari — sovg‘a qutisida.', 359000, 450000, 40, { Hajm: '3×30 ml' }, 4.4, 58, 210, 'perfume-set'));
  products.push(P(shop2, cats.kitoblar, '"Atomic Habits" — J. Klir (o‘zbek tilida)', 'Kichik odatlar — katta natijalar. Bestseller, qattiq muqova.', 89000, 120000, 150, { Muqova: 'Qattiq', Til: 'O‘zbek' }, 4.8, 203, 780, 'book-habits'));
  products.push(P(shop1, cats['oziq-ovqat'], 'Tabiiy asal 1kg (tog‘ asali)', 'Chust tog‘laridan yig‘ilgan sof tabiiy asal. Sertifikatlangan.', 129000, null, 70, { "Og'irlik": '1 kg', Manba: 'Tog‘ asali' }, 4.9, 167, 640, 'honey-mountain'));
  products.push(P(shop1, cats.uy, 'Choy servizi 12 kishilik (chinni)', 'Klassik naqshli chinni serviz — mehmonlar uchun bezak.', 549000, 690000, 14, { Material: 'Chinni', Kishilar: '12' }, 4.5, 41, 120, 'tea-set'));

  /* --- Ruscha nomlar (mobil ilova 3 tilda ishlaydi) --- */
  const catRu = {
    elektronika: 'Электроника', kiyim: 'Одежда', uy: 'Дом и быт',
    gozallik: 'Красота', sport: 'Спорт', bolalar: 'Для детей',
    'oziq-ovqat': 'Продукты', kitoblar: 'Книги',
    smartfonlar: 'Смартфоны', noutbuklar: 'Ноутбуки', quloqchinlar: 'Наушники',
    erkaklar: 'Мужская одежда', ayollar: 'Женская одежда',
  };
  const updCatRu = db.prepare('UPDATE categories SET name_ru = ? WHERE slug = ?');
  for (const [slug, ru] of Object.entries(catRu)) updCatRu.run(ru, slug);

  const productRu = {
    'Samsung Galaxy S24 Ultra 12/512GB': 'Samsung Galaxy S24 Ultra 12/512ГБ',
    'iPhone 15 Pro Max 256GB': 'iPhone 15 Pro Max 256ГБ',
    'Xiaomi Redmi Note 13 Pro 8/256GB': 'Xiaomi Redmi Note 13 Pro 8/256ГБ',
    'MacBook Air 13" M3 8/256GB': 'MacBook Air 13" M3 8/256ГБ',
    'Lenovo IdeaPad Slim 3 i5/16/512': 'Lenovo IdeaPad Slim 3 i5/16/512',
    'AirPods Pro 2 (USB-C)': 'AirPods Pro 2 (USB-C)',
    'Sony WH-1000XM5': 'Sony WH-1000XM5',
    'Xiaomi Mi Smart Band 9': 'Xiaomi Mi Smart Band 9',
    'Xiaomi Robot Vacuum S12': 'Робот-пылесос Xiaomi S12',
    'Erkaklar klassik ko‘ylagi (oq)': 'Мужская классическая рубашка (белая)',
    'Jinsi shim slim-fit (to‘q ko‘k)': 'Джинсы slim-fit (тёмно-синие)',
    'Ayollar yozgi ko‘ylagi (gulli)': 'Женское летнее платье (цветочное)',
    'Ayollar charm sumkasi': 'Женская кожаная сумка',
    'Yoga to‘shagi 6mm (TPE)': 'Коврик для йоги 6мм (TPE)',
    'Krossovka Running Pro (unisex)': 'Кроссовки Running Pro (унисекс)',
    'LEGO Classic 500 detal to‘plami': 'Набор LEGO Classic 500 деталей',
    'Bolalar velosipedi 16" (qizil)': 'Детский велосипед 16" (красный)',
    'Parfyum to‘plami (3x30ml)': 'Парфюмерный набор (3x30мл)',
    '"Atomic Habits" — J. Klir (o‘zbek tilida)': '«Атомные привычки» — Дж. Клир',
    'Tabiiy asal 1kg (tog‘ asali)': 'Натуральный мёд 1кг (горный)',
    'Choy servizi 12 kishilik (chinni)': 'Чайный сервиз на 12 персон (фарфор)',
  };
  const updProdRu = db.prepare('UPDATE products SET name_ru = ? WHERE name = ?');
  for (const [uz, ru] of Object.entries(productRu)) updProdRu.run(ru, uz);

  /* --- Moderatsiyada turgan mahsulot (admin panelda ko'rinadi) --- */
  db.prepare(
    `INSERT INTO products (shop_id, category_id, name, description, price, stock, images, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'moderation')`
  ).run(shop2, cats.gozallik, 'Soch feni Professional 2200W', 'Ionlash funksiyasi, 2 tezlik, 3 harorat rejimi.', 279000, 18, JSON.stringify([img('hair-dryer')]));

  /* --- Bannerlar --- */
  const insertBanner = db.prepare(
    'INSERT INTO banners (title, image, link_type, link_id, sort) VALUES (?, ?, ?, ?, ?)'
  );
  insertBanner.run('Katta chegirmalar — 40% gacha!', img('banner-sale', 1200, 480), 'category', cats.elektronika, 0);
  insertBanner.run('Yozgi kolleksiya keldi', img('banner-summer', 1200, 480), 'category', cats.kiyim, 1);
  insertBanner.run('Flagman smartfonlar', img('banner-phones', 1200, 480), 'product', products[0], 2);

  /* --- Kuponlar --- */
  const insertCoupon = db.prepare(
    'INSERT INTO coupons (code, type, value, min_total, expires_at) VALUES (?, ?, ?, ?, ?)'
  );
  insertCoupon.run('SALOM10', 'percent', 10, 100000, null);
  insertCoupon.run('ADM50', 'fixed', 50000, 500000, null);

  /* --- Demo buyurtma va sharh (haridor tomonidan) --- */
  const addr = db
    .prepare(
      "INSERT INTO addresses (user_id, label, region, city, street, phone, is_default) VALUES (?, 'Uy', 'Namangan viloyati', 'Chust', 'Istiqlol ko‘chasi 12-uy', '+998904445566', 1)"
    )
    .run(buyerId);

  const price = 490000;
  const orderId = db
    .prepare(
      `INSERT INTO orders (user_id, shop_id, address, payment_method, payment_status, subtotal, shipping_fee, discount, total, status, created_at)
       VALUES (?, ?, ?, 'card', 'paid', ?, 0, 0, ?, 'delivered', datetime('now', '-5 days'))`
    )
    .run(
      buyerId, shop1,
      JSON.stringify({ label: 'Uy', region: 'Namangan viloyati', city: 'Chust', street: 'Istiqlol ko‘chasi 12-uy', phone: '+998904445566' }),
      price, price
    ).lastInsertRowid;
  const bandId = products[7];
  db.prepare('INSERT INTO order_items (order_id, product_id, name, price, qty, image) VALUES (?, ?, ?, ?, ?, ?)').run(
    orderId, bandId, 'Xiaomi Mi Smart Band 9', price, 1, img('mi-band')
  );
  for (const [st, note, d] of [
    ['pending', 'Buyurtma qabul qilindi', '-5 days'],
    ['confirmed', 'Sotuvchi tasdiqladi', '-5 days'],
    ['shipped', 'Kuryer yo‘lga chiqdi', '-4 days'],
    ['delivered', 'Yetkazib berildi', '-3 days'],
  ]) {
    db.prepare(
      `INSERT INTO order_status_history (order_id, status, note, created_at) VALUES (?, ?, ?, datetime('now', ?))`
    ).run(orderId, st, note, d);
  }
  db.prepare(
    "INSERT INTO reviews (product_id, user_id, order_id, rating, comment, created_at) VALUES (?, ?, ?, 5, 'Juda zo‘r mahsulot, tez yetkazib berishdi. Tavsiya qilaman!', datetime('now', '-2 days'))"
  ).run(bandId, buyerId, orderId);

  return { adminId, buyerId, addr: addr.lastInsertRowid };
});

seed();
console.log(`✅ Seed muvaffaqiyatli yakunlandi!

Demo hisoblar (parol hammasi uchun: 123456):
  👑 Admin:     admin@admbozor.uz
  🏪 Sotuvchi:  texno@admbozor.uz  (TexnoOlam)
  🏪 Sotuvchi:  moda@admbozor.uz   (ModaLine)
  🛒 Haridor:   haridor@admbozor.uz

Promokodlar: SALOM10 (10%), ADM50 (50 000 so'm)`);
