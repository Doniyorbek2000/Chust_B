/** ChustMarket mobil ilova dizayn tokenlari */
export const colors = {
  brand: '#2a78d6',
  brandDark: '#1c5cab',
  brandSoft: '#e7f1fd',
  bg: '#f4f5f7',
  surface: '#ffffff',
  ink: '#14181f',
  ink2: '#5a6069',
  muted: '#9aa0a8',
  line: '#e9eaee',
  good: '#0ca30c',
  goodText: '#0a7a0a',
  warn: '#f59e0b',
  danger: '#e0342f',
  sale: '#e0342f',
  star: '#f5a623',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };

export const fmtSum = (n) => `${Number(n || 0).toLocaleString('ru-RU')} so'm`;

export const fmtDate = (s) => {
  if (!s) return '—';
  const d = new Date(s.includes('T') ? s : s + 'Z');
  return d.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

export const ORDER_STATUS = {
  pending: { label: 'Kutilmoqda', color: '#b7791f', bg: '#fdf2dc', icon: '🕐' },
  confirmed: { label: 'Tasdiqlandi', color: '#1c5cab', bg: '#e7f1fd', icon: '✅' },
  shipped: { label: "Yo'lda", color: '#9c4a13', bg: '#fdeadc', icon: '🚚' },
  delivered: { label: 'Yetkazildi', color: '#0a7a0a', bg: '#e2f6e2', icon: '📦' },
  cancelled: { label: 'Bekor qilindi', color: '#a12622', bg: '#fbe5e4', icon: '✖️' },
};
