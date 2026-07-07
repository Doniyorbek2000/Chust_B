import { useEffect, useState } from 'react';
import { api, fmtSum, fmtDate } from '../api.js';
import { Badge, Pagination, Modal, useToast } from '../components/ui.jsx';

const STATUS_TABS = [
  ['', 'Barchasi'], ['pending', 'Yangi'], ['confirmed', 'Tasdiqlangan'],
  ['shipped', "Yo'lda"], ['delivered', 'Yetkazilgan'], ['cancelled', 'Bekor qilingan'],
];

// joriy holatdan keyingi mumkin bo'lgan amallar
const NEXT_ACTIONS = {
  pending: [['confirmed', 'Tasdiqlash', 'primary'], ['cancelled', 'Bekor qilish', 'danger']],
  confirmed: [['shipped', "Jo'natish", 'primary'], ['cancelled', 'Bekor qilish', 'danger']],
  shipped: [['delivered', 'Yetkazildi', 'primary']],
  delivered: [],
  cancelled: [],
};

export default function Orders() {
  const [data, setData] = useState({ orders: [], pages: 1, total: 0 });
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const [toast, showToast] = useToast();

  const load = () => {
    const params = new URLSearchParams({ page, ...(status && { status }) });
    api(`/seller/orders?${params}`).then(setData).catch((e) => showToast(e.message));
  };
  useEffect(load, [page, status]); // eslint-disable-line

  const updateStatus = async (order, newStatus) => {
    try {
      await api(`/seller/orders/${order.id}/status`, { method: 'PATCH', body: { status: newStatus } });
      showToast('Holat yangilandi — haridorga bildirishnoma yuborildi');
      setViewing(null);
      load();
    } catch (e) {
      showToast(e.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Buyurtmalar</h1>
          <div className="sub">Jami: {data.total}</div>
        </div>
      </div>

      <div className="filters">
        {STATUS_TABS.map(([s, label]) => (
          <button key={s} className={`btn sm ${status === s ? 'primary' : ''}`}
            onClick={() => { setStatus(s); setPage(1); }}>{label}</button>
        ))}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>№</th><th>Haridor</th><th>Mahsulotlar</th><th>Summa</th><th>To'lov</th><th>Holat</th><th>Sana</th><th /></tr>
          </thead>
          <tbody>
            {data.orders.map((o) => (
              <tr key={o.id}>
                <td className="num"><strong>#{o.id}</strong></td>
                <td>
                  {o.buyer_name}
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>{o.address.phone}</div>
                </td>
                <td className="num">{o.items.length} ta</td>
                <td className="num">{fmtSum(o.total)}</td>
                <td>{o.payment_method === 'card' ? '💳' : '💵'} {{ pending: 'kutilmoqda', paid: "to'langan", refunded: 'qaytarilgan' }[o.payment_status]}</td>
                <td><Badge kind="order" value={o.status} /></td>
                <td>{fmtDate(o.created_at)}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn sm" onClick={() => setViewing(o)}>Ko'rish</button>{' '}
                  {NEXT_ACTIONS[o.status].map(([st, label, cls]) => (
                    <button key={st} className={`btn sm ${cls}`} onClick={() => updateStatus(o, st)}>
                      {label}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
            {data.orders.length === 0 && <tr><td colSpan={8} className="empty">Buyurtma yo'q</td></tr>}
          </tbody>
        </table>
        <Pagination page={page} pages={data.pages} onPage={setPage} />
      </div>

      {viewing && (
        <Modal title={`Buyurtma #${viewing.id}`} onClose={() => setViewing(null)}>
          <table style={{ marginBottom: 14 }}>
            <tbody>
              {viewing.items.map((it) => (
                <tr key={it.id}>
                  <td style={{ width: 54 }}>{it.image && <img className="thumb" src={it.image} alt="" />}</td>
                  <td>{it.name}</td>
                  <td className="num" style={{ whiteSpace: 'nowrap' }}>{it.qty} × {fmtSum(it.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table>
            <tbody>
              <tr><td>Haridor</td><td>{viewing.buyer_name} — {viewing.address.phone}</td></tr>
              <tr><td>Manzil</td><td>{viewing.address.region}, {viewing.address.city}, {viewing.address.street}</td></tr>
              <tr><td>Yetkazish</td><td className="num">{viewing.shipping_fee ? fmtSum(viewing.shipping_fee) : 'Bepul'}</td></tr>
              {viewing.discount > 0 && <tr><td>Chegirma</td><td className="num">−{fmtSum(viewing.discount)}</td></tr>}
              <tr><td><strong>Jami</strong></td><td className="num"><strong>{fmtSum(viewing.total)}</strong></td></tr>
            </tbody>
          </table>
          <div className="actions">
            {NEXT_ACTIONS[viewing.status].map(([st, label, cls]) => (
              <button key={st} className={`btn ${cls}`} onClick={() => updateStatus(viewing, st)}>
                {label}
              </button>
            ))}
          </div>
        </Modal>
      )}
      {toast}
    </>
  );
}
