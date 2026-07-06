# 🛒 ChustMarket — Onlayn bozor platformasi

Amazon, Uzum Market, Temu uslubidagi to'liq marketplace tizimi. Uch tomonlama arxitektura:

| Qism | Texnologiya | Kim uchun |
|------|-------------|-----------|
| **`server/`** | Node.js + Express + SQLite | Yagona REST API (barcha ilovalar uchun) |
| **`admin-web/`** | React + Vite | 👑 Administrator — platformani boshqarish |
| **`seller-web/`** | React + Vite | 🏪 Sotuvchi — do'kon va mahsulotlarni boshqarish |
| **`mobile/`** | React Native (Expo) | 🛍️ Haridor — mobil ilova (Android/iOS) |

## Imkoniyatlar

### 🛍️ Haridor (mobil ilova)
- Ro'yxatdan o'tish / kirish (JWT, sessiya saqlanadi)
- Bosh sahifa: avtomatik aylanuvchi bannerlar, kategoriyalar, chegirmalar, ommabop va yangi mahsulotlar
- Katalog: kategoriyalar daraxti (bo'lim → ichki bo'limlar)
- Qidiruv: jonli natijalar (debounce), qidiruv tarixi
- Mahsulotlar ro'yxati: saralash (6 xil), narx filtri, cheksiz scroll
- Mahsulot sahifasi: rasm galereyasi, xususiyatlar, sharhlar, o'xshash mahsulotlar, do'kon ma'lumoti
- Savat: miqdor o'zgartirish, ombor nazorati, yetkazib berish hisobi (300 000 so'mdan bepul)
- Buyurtma berish: manzil tanlash, to'lov usuli (naqd/karta), promokod
- Buyurtmalarim: jarayon chizig'i (kutilmoqda → tasdiqlandi → yo'lda → yetkazildi), bekor qilish
- Yetkazilgan mahsulotni baholash (1–5 yulduz + sharh)
- Sevimlilar, manzillar, bildirishnomalar, profil sozlamalari

### 🏪 Sotuvchi (web panel)
- Ro'yxatdan o'tish (do'kon admin tasdig'idan keyin faollashadi)
- Dashboard: savdo statistikasi, 14 kunlik grafik, eng ko'p sotilganlar, ombor ogohlantirishlari
- Mahsulot CRUD: rasm yuklash (fayl yoki URL), xususiyatlar, chegirma narxi — yangi mahsulot moderatsiyaga tushadi
- Buyurtmalarni boshqarish: holat o'tkazish (tasdiqlash → jo'natish → yetkazildi), bekor qilishda ombor qaytadi
- Do'kon sozlamalari, parol almashtirish

### 👑 Admin (web panel)
- Dashboard: platforma statistikasi, savdo grafigi, buyurtma holatlari taqsimoti, top do'konlar
- Foydalanuvchilarni boshqarish (bloklash/blokdan chiqarish)
- Do'konlarni tasdiqlash/bloklash
- Mahsulot moderatsiyasi (tasdiqlash/rad etish sababi bilan — sotuvchiga bildirishnoma boradi)
- Kategoriyalar (daraxt), bannerlar, promokodlar CRUD
- Barcha buyurtmalarni kuzatish

### ⚙️ Muhim biznes qoidalar
- Savat bir nechta do'kondan bo'lsa, **har bir do'konga alohida buyurtma** yaratiladi (haqiqiy marketplace kabi)
- Buyurtma holatlari qat'iy oqim bo'yicha o'tadi; noto'g'ri o'tish server tomonidan rad etiladi
- Buyurtmada ombor kamayadi, bekor qilinganda qaytadi
- Promokod chegirmasi do'konlar o'rtasida summaga mutanosib taqsimlanadi
- Reyting sharhlardan avtomatik qayta hisoblanadi
- RBAC: har bir endpoint rol bo'yicha himoyalangan

## Ishga tushirish

### 1. Server (API)
```bash
cd server
npm install
npm run seed     # demo ma'lumotlar (bir marta)
npm start        # http://localhost:4000
```

### 2. Admin panel
```bash
cd admin-web
npm install
npm run dev      # http://localhost:5173
```

### 3. Sotuvchi paneli
```bash
cd seller-web
npm install
npm run dev      # http://localhost:5174
```

### 4. Mobil ilova
```bash
cd mobile
npm install
# MUHIM: app.json → expo.extra.apiUrl ga kompyuteringizning
# lokal IP manzilini yozing (masalan http://192.168.1.10:4000).
# Android emulyator uchun: http://10.0.2.2:4000
npx expo start   # Expo Go ilovasida QR kodni skanerlang
```

## Demo hisoblar (parol: `123456`)

| Rol | Email | Qayerda |
|-----|-------|---------|
| 👑 Admin | `admin@chust.uz` | admin-web (5173) |
| 🏪 Sotuvchi | `texno@chust.uz` | seller-web (5174) |
| 🏪 Sotuvchi | `moda@chust.uz` | seller-web (5174) |
| 🛍️ Haridor | `haridor@chust.uz` | mobil ilova |

Promokodlar: `SALOM10` (10%, min 100 000 so'm), `CHUST50` (50 000 so'm, min 500 000 so'm)

## API qisqacha

```
POST   /api/auth/register|login          GET/PATCH /api/auth/me
GET    /api/categories|banners|shops/:id
GET    /api/products?q=&category=&shop=&min_price=&max_price=&sort=&page=
GET    /api/products/:id                 GET /api/products/:id/reviews
GET/POST/PATCH/DELETE /api/cart[/:itemId]
GET/POST/PATCH/DELETE /api/me/addresses[/:id]
GET/POST/DELETE /api/me/favorites[/:productId]
GET    /api/me/notifications             POST /api/me/notifications/read
POST   /api/orders                       POST /api/orders/validate-coupon
GET    /api/orders[/:id]                 POST /api/orders/:id/cancel|review
GET    /api/seller/dashboard|products|orders   (rol: seller)
PATCH  /api/seller/orders/:id/status|shop|products/:id
GET    /api/admin/dashboard|users|shops|products|orders|banners|coupons|categories  (rol: admin)
POST   /api/upload  (multipart, 5 tagacha rasm)
```

## Texnik tafsilotlar
- **Baza:** SQLite (better-sqlite3, WAL) — `server/data/chust.db` avtomatik yaratiladi
- **Auth:** JWT (30 kun), bcrypt parol xesh, rol asosida ruxsat
- **Rasmlar:** `server/uploads/` ga yuklanadi, `/uploads/*` orqali beriladi
- **Prod uchun:** `JWT_SECRET`, `PORT`, `DB_FILE` env o'zgaruvchilari qo'llab-quvvatlanadi
