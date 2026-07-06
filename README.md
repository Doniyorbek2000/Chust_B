# 🛒 ADM Bozor — Onlayn bozor platformasi

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
- Katalog: kategoriyalar daraxti; qidiruv: jonli natijalar va qidiruv tarixi
- Mahsulotlar ro'yxati: saralash (6 xil), narx filtri, cheksiz scroll
- Mahsulot sahifasi: rasm galereyasi, xususiyatlar, sharhlar, o'xshash mahsulotlar, do'kon
- Savat: miqdor boshqaruvi, ombor nazorati, yetkazish hisobi (300 000 so'mdan bepul)
- Buyurtma: manzil, to'lov usuli (naqd/karta), promokod
- Buyurtma kuzatuvi: jarayon chizig'i, tarix, bekor qilish; yetkazilganini baholash
- Sevimlilar, manzillar, bildirishnomalar, profil

### 🏪 Sotuvchi (web panel — `/seller`)
- Ro'yxatdan o'tish (do'kon admin tasdig'idan keyin faollashadi)
- Dashboard: savdo statistikasi, 14 kunlik grafik, top mahsulotlar, ombor ogohlantirishlari
- Mahsulot CRUD: rasm yuklash (fayl/URL), xususiyatlar, chegirma — yangi mahsulot moderatsiyaga tushadi
- Buyurtma holatlari: tasdiqlash → jo'natish → yetkazildi; bekor qilishda ombor qaytadi
- Do'kon sozlamalari, parol almashtirish

### 👑 Admin (web panel — `/admin`)
- Dashboard: platforma statistikasi, savdo grafigi, holatlar taqsimoti, top do'konlar
- Foydalanuvchilar (bloklash), do'konlarni tasdiqlash/bloklash
- Mahsulot moderatsiyasi (rad sababi sotuvchiga bildirishnoma bo'lib boradi)
- Kategoriyalar (daraxt), bannerlar, promokodlar

### ⚙️ Biznes qoidalar
- Savat bir necha do'kondan bo'lsa, **har do'konga alohida buyurtma** yaratiladi
- Buyurtma holatlari qat'iy oqim bo'yicha; noto'g'ri o'tish server tomonidan rad etiladi
- Buyurtmada ombor kamayadi, bekor qilinganda qaytadi
- Promokod chegirmasi do'konlar o'rtasida summaga mutanosib taqsimlanadi
- Faqat yetkazilgan buyurtma mahsulotini baholash mumkin; reyting avtomatik qayta hisoblanadi
- RBAC: har bir endpoint rol bo'yicha himoyalangan

### 🔒 Xavfsizlik (production)
- `JWT_SECRET` production'da **majburiy** (bo'lmasa server ishga tushmaydi)
- Helmet (xavfsizlik headerlari), gzip compression
- Rate-limit: umumiy 300 so'rov/daqiqa, login/registerga 30 so'rov/15 daqiqa (brute-force himoyasi)
- CORS whitelist (`CORS_ORIGINS`), reverse-proxy uchun `trust proxy`
- Parollar bcrypt bilan xeshlanadi; rasm yuklash: faqat JPG/PNG/WEBP/GIF, 5 MB, 5 tagacha
- Graceful shutdown, birinchi ishga tushishda `ADMIN_EMAIL`/`ADMIN_PASSWORD` orqali admin yaratish

---

## 🚀 Lokal ishga tushirish (development)

```bash
# 1. API server
cd server && npm install && npm run seed && npm start   # http://localhost:4000

# 2. Admin panel
cd admin-web && npm install && npm run dev              # http://localhost:5173/admin/

# 3. Sotuvchi paneli
cd seller-web && npm install && npm run dev             # http://localhost:5174/seller/

# 4. Mobil ilova (kompyuter IP sini ko'rsating)
cd mobile && npm install
EXPO_PUBLIC_API_URL=http://192.168.1.10:4000 npx expo start   # Expo Go bilan skanerlang
```

### Demo hisoblar (parol: `123456`)

| Rol | Email |
|-----|-------|
| 👑 Admin | `admin@admbozor.uz` |
| 🏪 Sotuvchi | `texno@admbozor.uz`, `moda@admbozor.uz` |
| 🛍️ Haridor | `haridor@admbozor.uz` |

Promokodlar: `SALOM10` (10%, min 100 000), `ADM50` (50 000 so'm, min 500 000)

> ⚠️ **Production'da `npm run seed` ISHLATMANG** — bu demo ma'lumotlar. Haqiqiy serverda admin `ADMIN_EMAIL`/`ADMIN_PASSWORD` env orqali yaratiladi, qolganlari ro'yxatdan o'tadi.

---

## 🌐 Serverga joylash (production)

Admin va sotuvchi panellari **build qilingach API serverning o'zidan** beriladi:
`https://domen.uz/admin` va `https://domen.uz/seller` — alohida hosting kerak emas.

### Variant A — Docker (tavsiya etiladi)

```bash
# .env yarating:
cat > .env << 'ENV'
JWT_SECRET=$(openssl rand -hex 32)   # qo'lda qiymat qo'ying
ADMIN_EMAIL=admin@admbozor.uz
ADMIN_PASSWORD=KuchliParol123!
CORS_ORIGINS=https://admbozor.uz
ENV

docker compose up -d --build         # 4000-portda ishga tushadi
```

### Variant B — PM2 bilan

```bash
# Panellarni build qiling
cd admin-web && npm ci && npm run build && cd ..
cd seller-web && npm ci && npm run build && cd ..

# Serverni ishga tushiring
cd server && npm ci --omit=dev
cp .env.example .env && nano .env    # JWT_SECRET va adminni to'ldiring
npm i -g pm2
pm2 start src/index.js --name admbozor --env production
pm2 save && pm2 startup
```

### Nginx (HTTPS reverse-proxy)

```nginx
server {
    server_name admbozor.uz api.admbozor.uz;
    client_max_body_size 10m;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
# HTTPS: sudo certbot --nginx -d admbozor.uz -d api.admbozor.uz
```

**Zaxira nusxa:** SQLite bazasi bitta fayl — `server/data/admbozor.db` va `server/uploads/` papkasini muntazam nusxalang (cron + rsync yetarli).

---

## 📱 Play Market'ga chiqarish

Ilova `mobile/` papkasida Play Market uchun tayyor: paket nomi `uz.admbozor.app`,
ikonka/adaptive-icon/splash (`assets/`), minimal ruxsatlar (faqat INTERNET).

```bash
cd mobile
npm i -g eas-cli
eas login                      # Expo hisobingiz
eas init                       # projectId ni app.json ga yozadi
eas build -p android --profile production   # .aab fayl yaratadi
eas submit -p android          # Play Console'ga yuboradi (service account kerak)
```

### Chiqarishdan oldingi tekshiruv ro'yxati
1. ✅ `app.json` → `extra.apiUrl` — **haqiqiy HTTPS API manzilingiz** (masalan `https://api.admbozor.uz`). Play Market ilovalari HTTP bilan ishlamaydi (cleartext taqiqlangan)
2. ✅ Server HTTPS bilan ishga tushirilgan (yuqoridagi Nginx + certbot)
3. Play Console'da: ilova ma'lumotlari, skrinshotlar (telefon + 7" planshet), 512×512 ikonka (`assets/icon.png` dan), feature graphic 1024×500
4. **Maxfiylik siyosati URL** majburiy — sayt sahifasi yarating (qanday ma'lumot yig'iladi: ism, email, telefon, manzil — buyurtma yetkazish uchun)
5. Data safety anketasi: hisob ma'lumotlari + manzil yig'iladi, uchinchi tomonga berilmaydi
6. Yangi versiya chiqarishda `eas build` avtomatik `versionCode` ni oshiradi (`autoIncrement`)

### iOS (App Store) uchun ham tayyor
`bundleIdentifier: uz.admbozor.app` — `eas build -p ios` (Apple Developer hisobi kerak).

---

## API qisqacha

```
POST   /api/auth/register|login          GET/PATCH /api/auth/me     POST /api/auth/change-password
GET    /api/categories|banners|shops/:id
GET    /api/products?q=&category=&shop=&min_price=&max_price=&sort=&page=
GET    /api/products/:id                 GET /api/products/:id/reviews
GET/POST/PATCH/DELETE /api/cart[/:itemId]
GET/POST/PATCH/DELETE /api/me/addresses[/:id]
GET/POST/DELETE /api/me/favorites[/:productId]
GET    /api/me/notifications             POST /api/me/notifications/read
POST   /api/orders                       POST /api/orders/validate-coupon
GET    /api/orders[/:id]                 POST /api/orders/:id/cancel|review
GET    /api/seller/dashboard|products|orders     (rol: seller)
POST/PATCH/DELETE /api/seller/products[/:id]     PATCH /api/seller/orders/:id/status|shop
GET/POST/PATCH/DELETE /api/admin/...             (rol: admin)
POST   /api/upload  (multipart, 5 tagacha rasm, 5 MB)
```

## Env o'zgaruvchilari (server)

| Nomi | Majburiy | Tavsif |
|------|----------|--------|
| `NODE_ENV` | prod'da | `production` |
| `JWT_SECRET` | prod'da ✅ | `openssl rand -hex 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | birinchi ishga tushishda | Admin hisobini yaratadi |
| `CORS_ORIGINS` | tavsiya | Ruxsat etilgan originlar (vergul bilan) |
| `PORT`, `DB_FILE`, `UPLOADS_DIR` | yo'q | Standart: 4000, `data/admbozor.db`, `uploads/` |
| `SHIPPING_FEE`, `FREE_SHIPPING_FROM` | yo'q | 15 000 / 300 000 so'm |

## Keyingi bosqich uchun tavsiyalar
- **To'lov integratsiyasi:** hozir karta to'lovi demo rejimda. Payme/Click merchant shartnomasidan so'ng `server/src/routes/order.routes.js` dagi `payment_status` oqimiga webhook qo'shiladi
- **SMS tasdiqlash:** Eskiz.uz yoki Playmobile orqali telefon raqamni tasdiqlash
- **Push bildirishnomalar:** Expo Notifications (server tokenlarni saqlab, buyurtma holatida yuboradi)
- **PostgreSQL:** yuk oshganda SQLite'dan ko'chish (better-sqlite3 → pg, SQL deyarli mos)
