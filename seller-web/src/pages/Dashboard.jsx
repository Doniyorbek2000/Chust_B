import { useEffect, useState } from 'react';
import { api, fmtSum } from '../api.js';
import { Stat, RevenueChart } from '../components/ui.jsx';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/seller/dashboard').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="form-error">{error}</div>;
  if (!data) return <div className="empty">Yuklanmoqda…</div>;

  const { stats, daily, topProducts, lowStock } = data;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <div className="sub">Do'koningiz ko'rsatkichlari</div>
        </div>
      </div>

      <div className="stat-grid">
        <Stat icon="💰" label="Jami savdo" value={fmtSum(stats.revenue)}
          hint={`bugun: ${fmtSum(stats.todayRevenue)}`} />
        <Stat icon="📦" label="Buyurtmalar" value={stats.orders}
          hint={`yangi: ${stats.pendingOrders} ta`} />
        <Stat icon="🛍️" label="Mahsulotlar" value={stats.products}
          hint={`faol: ${stats.activeProducts} ta`} />
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <h3>Savdo — oxirgi 14 kun</h3>
        <RevenueChart daily={daily} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-pad" style={{ paddingBottom: 0 }}><h3>Eng ko'p sotilganlar</h3></div>
          <table>
            <thead><tr><th>Mahsulot</th><th>Sotilgan</th><th>Ombor</th></tr></thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {p.image && <img className="thumb" src={p.image} alt="" />}
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="num">{p.sold_count}</td>
                  <td className="num">{p.stock}</td>
                </tr>
              ))}
              {topProducts.length === 0 && <tr><td colSpan={3} className="empty">Hozircha yo'q</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-pad" style={{ paddingBottom: 0 }}><h3>⚠️ Ombor tugayapti (≤5 dona)</h3></div>
          <table>
            <thead><tr><th>Mahsulot</th><th>Qoldiq</th></tr></thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="num" style={{ color: p.stock === 0 ? 'var(--critical)' : 'inherit', fontWeight: 700 }}>
                    {p.stock}
                  </td>
                </tr>
              ))}
              {lowStock.length === 0 && <tr><td colSpan={2} className="empty">Hammasi yetarli 👍</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
