import { useEffect, useState } from 'react';
import { api, fmtSum, fmtDate } from '../api.js';
import { Badge, Pagination, Modal, useToast } from '../components/ui.jsx';

const STATUS_TABS = [
  ['', 'Barchasi'], ['pending', 'Kutilmoqda'], ['confirmed', 'Tasdiqlangan'],
  ['shipped', "Yo'lda"], ['delivered', 'Yetkazilgan'], ['cancelled', 'Bekor qilingan'],
];

export default function Orders() {
  const [data, setData] = useState({ orders: [], pages: 1, total: 0 });
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const [toast, showToast] = useToast();

  useEffect(() => {
    const params = new URLSearchParams({ page, ...(status && { status }) });
    api(`/admin/orders?${params}`).then(setData).catch((e) => showToast(e.message));
  }, [page, status]); // eslint-disable-line

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Buyurtmalar</h1>
          <div className="sub">Platformadagi barcha buyurtmalar — jami: {data.total}</div>
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
            <tr><th>№</th><th>Haridor</th><th>Do'kon</th><th>Mahsulotlar</th><th>Summa</th><th>To'lov</th><th>Holat</th><th>Sana</th><th /></tr>
          </thead>
          <tbody>
            {data.orders.map((o) => (
              <tr key={o.id}>
                <td className="num"><strong>#{o.id}</strong></td>
                <td>{o.buyer_name}</td>
                <td>{o.shop_name}</td>
                <td className="num">{o.items.length} ta</td>
                <td className="num">{fmtSum(o.total)}</td>
                <td>{o.payment_method === 'card' ? '💳 Karta' : '💵 Naqd'}</td>
                <td><Badge kind="order" value={o.status} /></td>
                <td>{fmtDate(o.created_at)}</td>
                <td><button className="btn sm" onClick={() => setViewing(o)}>Ko'rish</button></td>
              </tr>
            ))}
            {data.orders.length === 0 && <tr><td colSpan={9} className="empty">Buyurtma topilmadi</td></tr>}
          </tbody>
        </table>
        <Pagination page={page} pages={data.pages} onPage={setPage} />
      </div>

      {viewing && <OrderModal order={viewing} onClose={() => setViewing(null)} />}
      {toast}
    </>
  );
}

export function OrderModal({ order, onClose }) {
  return (
    <Modal title={`Buyurtma #${order.id}`} onClose={onClose}>
      <table style={{ marginBottom: 14 }}>
        <tbody>
          {order.items.map((it) => (
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
          <tr><td>Mahsulotlar</td><td className="num">{fmtSum(order.subtotal)}</td></tr>
          <tr><td>Yetkazib berish</td><td className="num">{order.shipping_fee ? fmtSum(order.shipping_fee) : 'Bepul'}</td></tr>
          {order.discount > 0 && (
            <tr><td>Chegirma {order.coupon_code && `(${order.coupon_code})`}</td>
              <td className="num" style={{ color: 'var(--good-text)' }}>−{fmtSum(order.discount)}</td></tr>
          )}
          <tr><td><strong>Jami</strong></td><td className="num"><strong>{fmtSum(order.total)}</strong></td></tr>
          <tr><td>To'lov</td><td>{order.payment_method === 'card' ? '💳 Karta' : '💵 Naqd'} — {{ pending: 'kutilmoqda', paid: "to'langan", refunded: 'qaytarilgan' }[order.payment_status]}</td></tr>
          <tr><td>Manzil</td><td>{order.address.region}, {order.address.city}, {order.address.street}<br />
            <span style={{ color: 'var(--muted)' }}>{order.address.phone}</span></td></tr>
        </tbody>
      </table>
    </Modal>
  );
}
