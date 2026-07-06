import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { api, setToken } from '../api.js';

export default function Login() {
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ name: '', shopName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await api('/auth/register', {
          method: 'POST',
          body: { ...form, role: 'seller' },
        });
        // ro'yxatdan so'ng avtomatik kirish
        await login(form.email, form.password);
      }
    } catch (err) {
      setToken(null);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="brand">🏪 ChustMarket</div>
        <div className="brand-sub">Sotuvchilar paneli</div>
        {error && <div className="form-error">{error}</div>}

        {mode === 'register' && (
          <>
            <div className="field">
              <label>Ismingiz</label>
              <input value={form.name} onChange={set('name')} required minLength={2} />
            </div>
            <div className="field">
              <label>Do'kon nomi</label>
              <input value={form.shopName} onChange={set('shopName')} required minLength={2}
                placeholder="Masalan: TexnoOlam" />
            </div>
            <div className="field">
              <label>Telefon</label>
              <input value={form.phone} onChange={set('phone')} placeholder="+998 90 123 45 67" />
            </div>
          </>
        )}

        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={set('email')} required />
        </div>
        <div className="field">
          <label>Parol</label>
          <input type="password" value={form.password} onChange={set('password')} required minLength={6} />
        </div>

        <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
          {busy ? 'Yuborilmoqda…' : mode === 'login' ? 'Kirish' : "Do'kon ochish"}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--ink-2)' }}>
          {mode === 'login' ? (
            <>Do'koningiz yo'qmi?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setMode('register'); }}>
                Ro'yxatdan o'ting
              </a></>
          ) : (
            <>Hisobingiz bormi?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setMode('login'); }}>
                Kirish
              </a></>
          )}
        </p>
      </form>
    </div>
  );
}
