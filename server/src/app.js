import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config, isProduction } from './config.js';
import { optionalAuth } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/error.js';
import { authRouter } from './routes/auth.routes.js';
import { catalogRouter } from './routes/catalog.routes.js';
import { cartRouter } from './routes/cart.routes.js';
import { userRouter } from './routes/user.routes.js';
import { orderRouter } from './routes/order.routes.js';
import { sellerRouter } from './routes/seller.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { uploadRouter } from './routes/upload.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Panel buildi mavjud bo'lsa, uni SPA sifatida servis qiladi (bitta serverda deploy) */
function mountSpa(app, urlPath, distDir) {
  if (!fs.existsSync(path.join(distDir, 'index.html'))) return;
  app.use(urlPath, express.static(distDir, { maxAge: '1h', index: false }));
  app.get(`${urlPath}/*`, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
  app.get(urlPath, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

export function createApp() {
  const app = express();

  // Reverse-proxy (nginx) ortida to'g'ri IP olish uchun
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          // panel sahifalarida mahsulot rasmlari istalgan https manbadan bo'lishi mumkin
          'img-src': ["'self'", 'data:', 'https:', 'http:'],
        },
      },
    })
  );
  app.use(compression());
  app.use(
    cors(
      config.corsOrigins.length
        ? { origin: config.corsOrigins }
        : {} // dev: barcha originlar
    )
  );
  app.use(express.json({ limit: '2mb' }));

  // Umumiy rate-limit: bitta IP dan daqiqasiga 300 ta so'rov
  app.use(
    '/api',
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: 'So‘rovlar soni ko‘payib ketdi. Birozdan so‘ng urinib ko‘ring.' },
    })
  );

  // Auth endpointlariga qattiqroq limit (brute-force himoyasi)
  app.use(
    ['/api/auth/login', '/api/auth/register'],
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 30,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: 'Juda ko‘p urinish. 15 daqiqadan so‘ng qayta urinib ko‘ring.' },
    })
  );

  app.use(optionalAuth);
  app.use('/uploads', express.static(config.uploadsDir, { maxAge: '7d' }));

  app.get('/api/health', (_req, res) =>
    res.json({ ok: true, name: 'ADM Bozor API', env: isProduction ? 'production' : 'development' })
  );

  app.use('/api/auth', authRouter);
  app.use('/api', catalogRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/me', userRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/seller', sellerRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/upload', uploadRouter);

  // Admin va sotuvchi panellari build qilingan bo'lsa, shu serverdan beriladi:
  // https://domen.uz/admin  va  https://domen.uz/seller
  mountSpa(app, '/admin', path.join(__dirname, '..', '..', 'admin-web', 'dist'));
  mountSpa(app, '/seller', path.join(__dirname, '..', '..', 'seller-web', 'dist'));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
