import { useEffect, useState } from 'react';
import { api, fmtSum } from '../api.js';
import { Stat, RevenueChart, DistBars } from '../components/ui.jsx';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/dashboard').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="form-error">{error}</div>;
  if (!data) return <div className="empty">Yuklanmoqda…</div>;

  const { stats, daily, statusDist, topShops } = data;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <div className="sub">Platforma bo'yicha umumiy ko'rsatkichlar</div>
        </div>
      </div>

      <div className="stat-grid">
        <Stat icon="💰" label="Jami savdo" value={fmtSum(stats.revenue)} hint="bekor qilinganlarsiz" />
        <Stat icon="📦" label="Buyurtmalar" value={stats.orders} hint={`bugun: ${stats.todayOrders} ta`} />
        <Stat icon="🛍️" label="Faol mahsulotlar" value={stats.products}
          hint={`moderatsiyada: ${stats.moderationProducts} ta`} />
        <Stat icon="👥" label="Haridorlar" value={stats.users} />
        <Stat icon="🏪" label="Sotuvchilar" value={stats.sellers}
          hint={`tasdiq kutmoqda: ${stats.pendingShops} ta`} />
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <h3>Savdo — oxirgi 14 kun</h3>
          <RevenueChart daily={daily} />
        </div>
        <div className="card card-pad">
          <h3>Buyurtmalar holati</h3>
          <DistBars items={statusDist.map((s) => ({ label: s.label, n: s.n }))} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <h3>Eng yaxshi do'konlar</h3>
        </div>
        <table>
          <thead>
            <tr><th>Do'kon</th><th>Buyurtmalar</th><th>Savdo</th></tr>
          </thead>
          <tbody>
            {topShops.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td className="num">{s.orders}</td>
                <td className="num">{fmtSum(s.revenue)}</td>
              </tr>
            ))}
            {topShops.length === 0 && <tr><td colSpan={3} className="empty">Hozircha ma'lumot yo'q</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
