/** API mijoz — token localStorage'da saqlanadi */
const TOKEN_KEY = 'adm_seller_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

export async function api(path, { method = 'GET', body, formData } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: formData || (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) setToken(null);
    throw new Error(data.error || 'Xatolik yuz berdi');
  }
  return data;
}

export const fmtSum = (n) => `${Number(n || 0).toLocaleString('ru-RU')} so'm`;
export const fmtDate = (s) => {
  if (!s) return '—';
  const d = new Date(s.includes('T') ? s : s + 'Z');
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
