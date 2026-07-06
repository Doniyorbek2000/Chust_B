import { useEffect, useState } from 'react';
import { api, fmtSum } from '../api.js';
import { Modal, useToast } from '../components/ui.jsx';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [creating, setCreating] = useState(false);
  const [toast, showToast] = useToast();

  const load = () => api('/admin/coupons').then((d) => setCoupons(d.coupons)).catch((e) => showToast(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line

  const toggle = async (c) => {
    await api(`/admin/coupons/${c.id}`, { method: 'PATCH', body: { active: !c.active } });
    load();
  };
  const remove = async (c) => {
    await api(`/admin/coupons/${c.id}`, { method: 'DELETE' });
    showToast("O'chirildi");
    load();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Promokodlar</h1>
          <div className="sub">Chegirma kuponlarini boshqarish</div>
        </div>
        <button className="btn primary" onClick={() => setCreating(true)}>+ Yangi promokod</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Kod</th><th>Chegirma</th><th>Min. xarid</th><th>Muddat</th><th>Holat</th><th /></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} style={{ opacity: c.active ? 1 : 0.5 }}>
                <td><strong style={{ letterSpacing: '0.05em' }}>{c.code}</strong></td>
                <td className="num">{c.type === 'percent' ? `${c.value}%` : fmtSum(c.value)}</td>
                <td className="num">{c.min_total ? fmtSum(c.min_total) : '—'}</td>
                <td>{c.expires_at || 'Muddatsiz'}</td>
                <td>{c.active ? <span className="badge green">Faol</span> : <span className="badge gray">O'chirilgan</span>}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn sm" onClick={() => toggle(c)}>{c.active ? "O'chirish" : 'Yoqish'}</button>{' '}
                  <button className="btn sm danger" onClick={() => remove(c)}>Udalit</button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={6} className="empty">Promokod yo'q</td></tr>}
          </tbody>
        </table>
      </div>

      {creating && (
        <CouponModal onClose={() => setCreating(false)}
          onSaved={() => { setCreating(false); showToast('Yaratildi'); load(); }} />
      )}
      {toast}
    </>
  );
}

function CouponModal({ onClose, onSaved }) {
  const [code, setCode] = useState('');
  const [type, setType] = useState('percent');
  const [value, setValue] = useState('');
  const [minTotal, setMinTotal] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    try {
      await api('/admin/coupons', {
        method: 'POST',
        body: {
          code: code.trim().toUpperCase(),
          type,
          value: Number(value),
          min_total: Number(minTotal) || 0,
          expires_at: expiresAt || null,
        },
      });
      onSaved();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Modal title="Yangi promokod" onClose={onClose}>
      {error && <div className="form-error">{error}</div>}
      <div className="field">
        <label>Kod</label>
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CHUST2026" autoFocus />
      </div>
      <div className="field row">
        <div style={{ flex: 1 }}>
          <label>Turi</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="percent">Foiz (%)</option>
            <option value="fixed">Belgilangan summa</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>{type === 'percent' ? 'Foiz (1–90)' : "Summa (so'm)"}</label>
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
      </div>
      <div className="field row">
        <div style={{ flex: 1 }}>
          <label>Minimal xarid (so'm)</label>
          <input type="number" value={minTotal} onChange={(e) => setMinTotal(e.target.value)} placeholder="0" />
        </div>
        <div style={{ flex: 1 }}>
          <label>Tugash sanasi (ixtiyoriy)</label>
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </div>
      </div>
      <div className="actions">
        <button className="btn" onClick={onClose}>Bekor qilish</button>
        <button className="btn primary" onClick={save}>Yaratish</button>
      </div>
    </Modal>
  );
}
