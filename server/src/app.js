import express from 'express';
import cors from 'cors';
import { config } from './config.js';
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

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(optionalAuth);
  app.use('/uploads', express.static(config.uploadsDir, { maxAge: '7d' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'ChustMarket API' }));

  app.use('/api/auth', authRouter);
  app.use('/api', catalogRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/me', userRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/seller', sellerRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/upload', uploadRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
