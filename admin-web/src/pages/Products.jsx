import { useEffect, useState } from 'react';
import { api, fmtSum } from '../api.js';
import { Badge, Pagination, Modal, useToast } from '../components/ui.jsx';

export default function Products() {
  const [data, setData] = useState({ products: [], pages: 1, total: 0 });
  const [status, setStatus] = useState('moderation');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [rejecting, setRejecting] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [toast, showToast] = useToast();

  const load = () => {
    const params = new URLSearchParams({ page, ...(status && { status }), ...(q && { q }) });
    api(`/admin/products?${params}`).then(setData).catch((e) => showToast(e.message));
  };
  useEffect(load, [page, status]); // eslint-disable-line

  const moderate = async (p, action, reason = '') => {
    try {
      await api(`/admin/products/${p.id}/moderate`, { method: 'PATCH', body: { action, reason } });
      showToast(action === 'approve' ? 'Mahsulot tasdiqlandi' : 'Mahsulot rad etildi');
      setRejecting(null);
      load();
    } catch (e) {
      showToast(e.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mahsulotlar</h1>
          <div className="sub">Moderatsiya va nazorat — jami: {data.total}</div>
        </div>
      </div>

      <div className="filters">
        {[['moderation', 'Moderatsiyada'], ['active', 'Faol'], ['rejected', 'Rad etilgan'], ['', 'Barchasi']].map(([s, label]) => (
          <button key={s} className={`btn sm ${status === s ? 'primary' : ''}`}
            onClick={() => { setStatus(s); setPage(1); }}>{label}</button>
        ))}
        <input className="input" placeholder="Nomi bo'yicha qidirish…" value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())} />
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Mahsulot</th><th>Do'kon</th><th>Narx</th><th>Ombor</th><th>Holat</th><th /></tr>
          </thead>
          <tbody>
            {data.products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {p.image && <img className="thumb" src={p.image} alt="" />}
                    <div>
                      <strong>{p.name}</strong>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>#{p.id}</div>
                    </div>
                  </div>
                </td>
                <td>{p.shop_name}</td>
                <td className="num">{fmtSum(p.price)}</td>
                <td className="num">{p.stock}</td>
                <td><Badge kind="product" value={p.status} /></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn sm" onClick={() => setViewing(p)}>Ko'rish</button>{' '}
                  {p.status === 'moderation' && (
                    <>
                      <button className="btn sm primary" onClick={() => moderate(p, 'approve')}>Tasdiqlash</button>{' '}
                      <button className="btn sm danger" onClick={() => setRejecting(p)}>Rad etish</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {data.products.length === 0 && <tr><td colSpan={6} className="empty">Mahsulot topilmadi</td></tr>}
          </tbody>
        </table>
        <Pagination page={page} pages={data.pages} onPage={setPage} />
      </div>

      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewing(null)}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {viewing.images.map((src) => (
              <img key={src} src={src} alt="" style={{ width: 110, height: 110, borderRadius: 10, objectFit: 'cover' }} />
            ))}
          </div>
          <p style={{ color: 'var(--ink-2)' }}>{viewing.description || 'Tavsif yo‘q'}</p>
          <table>
            <tbody>
              <tr><td>Narx</td><td className="num"><strong>{fmtSum(viewing.price)}</strong>
                {viewing.old_price ? <s style={{ color: 'var(--muted)', marginLeft: 8 }}>{fmtSum(viewing.old_price)}</s> : null}</td></tr>
              <tr><td>Ombor</td><td className="num">{viewing.stock} dona</td></tr>
              <tr><td>Sotilgan</td><td className="num">{viewing.sold_count} dona</td></tr>
              <tr><td>Reyting</td><td className="num">⭐ {viewing.rating} ({viewing.rating_count} ta baho)</td></tr>
              {Object.entries(viewing.attributes || {}).map(([k, v]) => (
                <tr key={k}><td>{k}</td><td>{v}</td></tr>
              ))}
            </tbody>
          </table>
          {viewing.reject_reason && <div className="form-error" style={{ marginTop: 12 }}>Rad sababi: {viewing.reject_reason}</div>}
        </Modal>
      )}

      {rejecting && (
        <RejectModal product={rejecting} onClose={() => setRejecting(null)}
          onReject={(reason) => moderate(rejecting, 'reject', reason)} />
      )}
      {toast}
    </>
  );
}

function RejectModal({ product, onClose, onReject }) {
  const [reason, setReason] = useState('');
  return (
    <Modal title={`Rad etish: ${product.name}`} onClose={onClose}>
      <div className="field">
        <label>Rad etish sababi (sotuvchiga yuboriladi)</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="Masalan: rasm sifati past, tavsif to'liq emas…" autoFocus />
      </div>
      <div className="actions">
        <button className="btn" onClick={onClose}>Bekor qilish</button>
        <button className="btn danger" onClick={() => onReject(reason)}>Rad etish</button>
      </div>
    </Modal>
  );
}
