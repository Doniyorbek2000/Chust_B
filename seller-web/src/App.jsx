import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Orders from './pages/Orders.jsx';
import Settings from './pages/Settings.jsx';

const NAV = [
  ['/', '📊', 'Dashboard'],
  ['/orders', '📦', 'Buyurtmalar'],
  ['/products', '🛍️', 'Mahsulotlar'],
  ['/settings', '⚙️', "Do'kon sozlamalari"],
];

function Shell() {
  const { user, shop, logout, loading } = useAuth();

  if (loading) return <div className="empty" style={{ paddingTop: 120 }}>Yuklanmoqda…</div>;
  if (!user) return <Login />;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo">🏪 <span>{shop?.name || 'ChustMarket'}</span></div>
        <nav>
          {NAV.map(([to, icon, label]) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}>
              {icon} <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        {shop?.status === 'pending' && (
          <div style={{ margin: 10, padding: 12, background: 'rgba(250,178,25,0.15)', borderRadius: 10, fontSize: 12.5 }}>
            ⏳ Do'koningiz admin tasdig'ini kutmoqda. Tasdiqlangach mahsulot qo'shishingiz mumkin.
          </div>
        )}
        <div className="user">
          <div className="avatar">{user.name[0]}</div>
          <div>
            <strong>{user.name}</strong>
            <small>Sotuvchi</small>
          </div>
          <button title="Chiqish" onClick={logout}>⎋</button>
        </div>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider role="seller">
      <Shell />
    </AuthProvider>
  );
}
