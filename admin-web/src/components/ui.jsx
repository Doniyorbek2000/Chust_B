import { useState, useRef, useEffect } from 'react';
import { fmtSum } from '../api.js';

/* ---------- Holat belgilari ---------- */

const ORDER_BADGE = {
  pending: ['yellow', 'Kutilmoqda'],
  confirmed: ['blue', 'Tasdiqlandi'],
  shipped: ['orange', "Yo'lda"],
  delivered: ['green', 'Yetkazildi'],
  cancelled: ['red', 'Bekor qilindi'],
};
const SHOP_BADGE = {
  pending: ['yellow', 'Kutilmoqda'],
  approved: ['green', 'Tasdiqlangan'],
  blocked: ['red', 'Bloklangan'],
};
const PRODUCT_BADGE = {
  moderation: ['yellow', 'Moderatsiyada'],
  active: ['green', 'Faol'],
  rejected: ['red', 'Rad etilgan'],
  archived: ['gray', 'Arxivlangan'],
};
const USER_BADGE = { active: ['green', 'Faol'], blocked: ['red', 'Bloklangan'] };

export function Badge({ kind, value }) {
  const map = { order: ORDER_BADGE, shop: SHOP_BADGE, product: PRODUCT_BADGE, user: USER_BADGE }[kind];
  const [color, label] = map?.[value] || ['gray', value];
  return <span className={`badge ${color}`}>{label}</span>;
}

/* ---------- Modal ---------- */

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

/* ---------- Sahifalash ---------- */

export function Pagination({ page, pages, onPage }) {
  if (!pages || pages <= 1) return null;
  const items = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 2) items.push(p);
    else if (items[items.length - 1] !== '…') items.push('…');
  }
  return (
    <div className="pagination">
      {items.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`}>…</span>
        ) : (
          <button key={p} className={p === page ? 'on' : ''} onClick={() => onPage(p)}>
            {p}
          </button>
        )
      )}
    </div>
  );
}

/* ---------- Stat karta ---------- */

export function Stat({ label, value, hint, icon }) {
  return (
    <div className="card stat">
      <div className="label">{icon} {label}</div>
      <div className="value num">{value}</div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

/* ---------- Kunlik savdo grafigi (SVG ustunli) ----------
   Bitta seriya — legenda shart emas; hover'da tooltip. */

export function RevenueChart({ daily, days = 14 }) {
  const [tip, setTip] = useState(null);
  const wrapRef = useRef(null);

  // oxirgi N kunni to'ldirish (bo'sh kunlar 0 bilan)
  const byDay = Object.fromEntries((daily || []).map((d) => [d.day, d]));
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push({ day: key, revenue: byDay[key]?.revenue || 0, orders: byDay[key]?.orders || 0 });
  }

  const W = 640, H = 200, PAD_L = 8, PAD_B = 22, PAD_T = 8;
  const max = Math.max(1, ...series.map((s) => s.revenue));
  const innerW = W - PAD_L * 2;
  const step = innerW / series.length;
  const barW = Math.min(28, step * 0.62);
  const y = (v) => H - PAD_B - (v / max) * (H - PAD_B - PAD_T);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img"
        aria-label={`Oxirgi ${days} kunlik savdo grafigi`}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={PAD_L} x2={W - PAD_L} y1={y(max * f)} y2={y(max * f)}
            stroke="#e1e0d9" strokeWidth="1" />
        ))}
        <line x1={PAD_L} x2={W - PAD_L} y1={H - PAD_B} y2={H - PAD_B} stroke="#c3c2b7" strokeWidth="1" />
        {series.map((s, i) => {
          const x = PAD_L + i * step + (step - barW) / 2;
          const yTop = y(s.revenue);
          const h = Math.max(s.revenue > 0 ? 3 : 0, H - PAD_B - yTop);
          return (
            <g key={s.day}>
              {/* hover maydoni ustunning o'zidan kengroq */}
              <rect x={PAD_L + i * step} y={PAD_T} width={step} height={H - PAD_B - PAD_T}
                fill="transparent"
                onMouseEnter={(e) => {
                  const rect = wrapRef.current.getBoundingClientRect();
                  const svgRect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                  const cx = svgRect.left + ((PAD_L + i * step + step / 2) / W) * svgRect.width;
                  setTip({ x: cx - rect.left, y: (yTop / H) * svgRect.height, s });
                }}
                onMouseLeave={() => setTip(null)} />
              {h > 0 && (
                <path
                  d={`M${x},${H - PAD_B} L${x},${yTop + 4} Q${x},${yTop} ${x + 4},${yTop} L${x + barW - 4},${yTop} Q${x + barW},${yTop} ${x + barW},${yTop + 4} L${x + barW},${H - PAD_B} Z`}
                  fill="#2a78d6" pointerEvents="none" />
              )}
              {i % 2 === 0 && (
                <text x={PAD_L + i * step + step / 2} y={H - 6} textAnchor="middle"
                  fontSize="10" fill="#898781">
                  {s.day.slice(8)}/{s.day.slice(5, 7)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {tip && (
        <div className="chart-tooltip" style={{ left: tip.x, top: tip.y }}>
          <strong>{tip.s.day.slice(8)}.{tip.s.day.slice(5, 7)}</strong> — {fmtSum(tip.s.revenue)} · {tip.s.orders} ta buyurtma
        </div>
      )}
    </div>
  );
}

/* ---------- Gorizontal taqsimot (holatlar bo'yicha) ----------
   Har bir qator to'g'ridan-to'g'ri yozuv bilan — rang yagona kanal emas. */

export function DistBars({ items }) {
  const max = Math.max(1, ...items.map((i) => i.n));
  return (
    <div>
      {items.map((it) => (
        <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ width: 110, fontSize: 13, color: 'var(--ink-2)' }}>{it.label}</span>
          <div style={{ flex: 1, height: 14, background: '#efeeea', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${(it.n / max) * 100}%`, height: '100%', background: '#2a78d6', borderRadius: 4 }} />
          </div>
          <span className="num" style={{ width: 40, textAlign: 'right', fontWeight: 600 }}>{it.n}</span>
        </div>
      ))}
      {items.length === 0 && <div className="empty">Ma'lumot yo'q</div>}
    </div>
  );
}

/* ---------- Toast ---------- */

export function useToast() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(t);
  }, [msg]);
  return [msg ? <div className="toast" key={msg}>{msg}</div> : null, setMsg];
}

/* ---------- Tasdiqlash ---------- */

export function Confirm({ title, text, onOk, onClose, danger }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ color: 'var(--ink-2)' }}>{text}</p>
      <div className="actions">
        <button className="btn" onClick={onClose}>Bekor qilish</button>
        <button className={`btn ${danger ? 'danger' : 'primary'}`} onClick={onOk}>Tasdiqlash</button>
      </div>
    </Modal>
  );
}
