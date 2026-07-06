import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Users from './pages/Users.jsx';
import Shops from './pages/Shops.jsx';
import Categories from './pages/Categories.jsx';
import Products from './pages/Products.jsx';
import Orders from './pages/Orders.jsx';
import Banners from './pages/Banners.jsx';
import Coupons from './pages/Coupons.jsx';

const NAV = [
  ['/', '📊', 'Dashboard'],
  ['/orders', '📦', 'Buyurtmalar'],
  ['/products', '🛍️', 'Mahsulotlar'],
  ['/shops', '🏪', "Do'konlar"],
  ['/users', '👥', 'Foydalanuvchilar'],
  ['/categories', '🗂️', 'Kategoriyalar'],
  ['/banners', '🖼️', 'Bannerlar'],
  ['/coupons', '🎟️', 'Promokodlar'],
];

function Shell() {
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="empty" style={{ paddingTop: 120 }}>Yuklanmoqda…</div>;
  if (!user) return <Login />;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo">🛒 <span>ChustMarket</span></div>
        <nav>
          {NAV.map(([to, icon, label]) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}>
              {icon} <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="user">
          <div className="avatar">{user.name[0]}</div>
          <div>
            <strong>{user.name}</strong>
            <small>Administrator</small>
          </div>
          <button title="Chiqish" onClick={logout}>⎋</button>
        </div>
      </aside>
      <main className="main" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/users" element={<Users />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/banners" element={<Banners />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider role="admin">
      <Shell />
    </AuthProvider>
  );
}
