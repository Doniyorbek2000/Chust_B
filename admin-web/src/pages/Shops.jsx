import { useEffect, useState } from 'react';
import { api, fmtDate } from '../api.js';
import { Badge, useToast } from '../components/ui.jsx';

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [status, setStatus] = useState('');
  const [toast, showToast] = useToast();

  const load = () => {
    api(`/admin/shops${status ? `?status=${status}` : ''}`)
      .then((d) => setShops(d.shops))
      .catch((e) => showToast(e.message));
  };
  useEffect(load, [status]); // eslint-disable-line

  const setShopStatus = async (shop, newStatus) => {
    try {
      await api(`/admin/shops/${shop.id}/status`, { method: 'PATCH', body: { status: newStatus } });
      showToast('Holat yangilandi');
      load();
    } catch (e) {
      showToast(e.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Do'konlar</h1>
          <div className="sub">Sotuvchi do'konlarini tasdiqlash va boshqarish</div>
        </div>
      </div>

      <div className="filters">
        {['', 'pending', 'approved', 'blocked'].map((s) => (
          <button key={s} className={`btn sm ${status === s ? 'primary' : ''}`} onClick={() => setStatus(s)}>
            {{ '': 'Barchasi', pending: 'Kutilmoqda', approved: 'Tasdiqlangan', blocked: 'Bloklangan' }[s]}
          </button>
        ))}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Do'kon</th><th>Egasi</th><th>Mahsulotlar</th><th>Reyting</th><th>Holat</th><th>Ochilgan</th><th /></tr>
          </thead>
          <tbody>
            {shops.map((s) => (
              <tr key={s.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {s.logo && <img className="thumb" src={s.logo} alt="" />}
                    <div>
                      <strong>{s.name}</strong>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>{s.description?.slice(0, 50)}</div>
                    </div>
                  </div>
                </td>
                <td>
                  {s.seller_name}
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>{s.seller_email}</div>
                </td>
                <td className="num">{s.product_count}</td>
                <td className="num">⭐ {s.rating}</td>
                <td><Badge kind="shop" value={s.status} /></td>
                <td>{fmtDate(s.created_at)}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {s.status !== 'approved' && (
                    <button className="btn sm primary" onClick={() => setShopStatus(s, 'approved')}>Tasdiqlash</button>
                  )}{' '}
                  {s.status !== 'blocked' && (
                    <button className="btn sm danger" onClick={() => setShopStatus(s, 'blocked')}>Bloklash</button>
                  )}
                </td>
              </tr>
            ))}
            {shops.length === 0 && <tr><td colSpan={7} className="empty">Do'kon topilmadi</td></tr>}
          </tbody>
        </table>
      </div>
      {toast}
    </>
  );
}
