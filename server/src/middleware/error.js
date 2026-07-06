import multer from 'multer';

export function notFound(_req, res) {
  res.status(404).json({ error: 'Endpoint topilmadi' });
}

export function errorHandler(err, _req, res, _next) {
  // Multer xatolari (fayl hajmi/soni) — foydalanuvchi xatosi, 400
  if (err instanceof multer.MulterError) {
    const msg =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Rasm hajmi 5 MB dan oshmasligi kerak'
        : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Bir vaqtda ko‘pi bilan 5 ta rasm yuklash mumkin'
          : 'Fayl yuklashda xatolik';
    return res.status(400).json({ error: msg });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.status ? err.message : 'Serverda xatolik yuz berdi' });
}
