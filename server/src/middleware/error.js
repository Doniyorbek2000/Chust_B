export function notFound(_req, res) {
  res.status(404).json({ error: 'Endpoint topilmadi' });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.status ? err.message : 'Serverda xatolik yuz berdi' });
}
