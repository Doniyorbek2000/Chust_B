import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, loadToken, saveToken } from '../api/client';

/**
 * Global holat: foydalanuvchi, savat va sevimlilar.
 * Savat serverda saqlanadi — bu yerda faqat keshi turadi.
 */
const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }) {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [], subtotal: 0, shipping_fee: 0, total: 0 });
  const [favIds, setFavIds] = useState(new Set());

  const refreshCart = useCallback(async () => {
    try {
      setCart(await api('/cart'));
    } catch {
      /* tarmoq xatosi — eski kesh qoladi */
    }
  }, []);

  const refreshFavorites = useCallback(async () => {
    try {
      const d = await api('/me/favorites');
      setFavIds(new Set(d.favorites.map((p) => p.id)));
    } catch {
      /* jim */
    }
  }, []);

  // Ilova ochilishida saqlangan token bilan sessiyani tiklash
  useEffect(() => {
    (async () => {
      try {
        const token = await loadToken();
        if (token) {
          const d = await api('/auth/me');
          setUser(d.user);
          await Promise.all([refreshCart(), refreshFavorites()]);
        }
      } catch {
        await saveToken(null);
      } finally {
        setBooting(false);
      }
    })();
  }, [refreshCart, refreshFavorites]);

  const login = async (email, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { email, password } });
    if (d.user.role !== 'buyer') throw new Error('Bu ilova haridorlar uchun. Sotuvchi/admin panellari web orqali.');
    await saveToken(d.token);
    setUser(d.user);
    await Promise.all([refreshCart(), refreshFavorites()]);
  };

  const register = async (form) => {
    const d = await api('/auth/register', { method: 'POST', body: { ...form, role: 'buyer' } });
    await saveToken(d.token);
    setUser(d.user);
  };

  const logout = async () => {
    await saveToken(null);
    setUser(null);
    setCart({ items: [], subtotal: 0, shipping_fee: 0, total: 0 });
    setFavIds(new Set());
  };

  const addToCart = async (productId, qty = 1) => {
    setCart(await api('/cart', { method: 'POST', body: { product_id: productId, qty } }));
  };

  const updateCartItem = async (itemId, qty) => {
    setCart(await api(`/cart/${itemId}`, { method: 'PATCH', body: { qty } }));
  };

  const removeCartItem = async (itemId) => {
    setCart(await api(`/cart/${itemId}`, { method: 'DELETE' }));
  };

  const toggleFavorite = async (productId) => {
    const next = new Set(favIds);
    if (next.has(productId)) {
      next.delete(productId);
      setFavIds(next);
      await api(`/me/favorites/${productId}`, { method: 'DELETE' }).catch(() => refreshFavorites());
    } else {
      next.add(productId);
      setFavIds(next);
      await api(`/me/favorites/${productId}`, { method: 'POST' }).catch(() => refreshFavorites());
    }
  };

  const cartCount = cart.items.reduce((s, i) => s + i.qty, 0);

  return (
    <AppCtx.Provider
      value={{
        booting, user, setUser, login, register, logout,
        cart, cartCount, refreshCart, addToCart, updateCartItem, removeCartItem,
        favIds, toggleFavorite, refreshFavorites,
      }}>
      {children}
    </AppCtx.Provider>
  );
}
