import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children, role }) {
  const [user, setUser] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then((d) => {
        if (d.user.role !== role) throw new Error('Rol mos emas');
        setUser(d.user);
        setShop(d.shop || null);
      })
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, [role]);

  const login = async (email, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { email, password } });
    if (d.user.role !== role) throw new Error("Bu panel faqat tegishli rol uchun — hisobingiz mos emas");
    setToken(d.token);
    const me = await api('/auth/me');
    setUser(me.user);
    setShop(me.shop || null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setShop(null);
  };

  return (
    <AuthCtx.Provider value={{ user, shop, setShop, login, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}
