import bcrypt from 'bcryptjs';
import { createApp } from './app.js';
import { config, isProduction } from './config.js';
import { db } from './db/connection.js';

/**
 * Birinchi ishga tushirishda admin yaratish:
 * bazada admin bo'lmasa va ADMIN_EMAIL + ADMIN_PASSWORD env berilgan bo'lsa.
 * Bu production serverda seed'siz xavfsiz boshlash imkonini beradi.
 */
function bootstrapAdmin() {
  const hasAdmin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (hasAdmin) return;
  if (config.adminEmail && config.adminPassword) {
    if (config.adminPassword.length < 8) {
      console.error('❌ ADMIN_PASSWORD kamida 8 ta belgi bo‘lishi kerak');
      process.exit(1);
    }
    const hash = bcrypt.hashSync(config.adminPassword, 10);
    db.prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES ('Administrator', ?, ?, 'admin')"
    ).run(config.adminEmail.toLowerCase(), hash);
    console.log(`👑 Admin yaratildi: ${config.adminEmail}`);
  } else if (isProduction) {
    console.warn('⚠️  Bazada admin yo‘q. ADMIN_EMAIL va ADMIN_PASSWORD env orqali yarating.');
  }
}

bootstrapAdmin();

const app = createApp();
const server = app.listen(config.port, () => {
  console.log(`✅ ADM Bozor API ishga tushdi: http://localhost:${config.port}`);
  console.log(`   Muhit: ${isProduction ? 'production' : 'development'}`);
});

// Graceful shutdown — jarayon to'xtatilganda ochiq so'rovlar yakunlanadi
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    console.log(`\n${sig} qabul qilindi, server to‘xtatilmoqda…`);
    server.close(() => {
      db.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  });
}
