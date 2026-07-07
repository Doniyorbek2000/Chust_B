import { useEffect, useState } from 'react';
import { api, fmtSum, getToken } from '../api.js';
import { Badge, Pagination, Modal, Confirm, useToast } from '../components/ui.jsx';

export default function Products() {
  const [data, setData] = useState({ products: [], pages: 1, total: 0 });
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | {} | product
  const [removing, setRemoving] = useState(null);
  const [cats, setCats] = useState([]);
  const [toast, showToast] = useToast();

  const load = () => {
    const params = new URLSearchParams({ page, ...(q && { q }), ...(status && { status }) });
    api(`/seller/products?${params}`).then(setData).catch((e) => showToast(e.message));
  };
  useEffect(load, [page, status]); // eslint-disable-line

  useEffect(() => {
    api('/categories').then((d) => {
      const flat = [];
      for (const c of d.categories) {
        flat.push({ id: c.id, name: c.name, depth: 0 });
        for (const ch of c.children || []) flat.push({ id: ch.id, name: ch.name, depth: 1 });
      }
      setCats(flat);
    });
  }, []);

  const remove = async () => {
    await api(`/seller/products/${removing.id}`, { method: 'DELETE' });
    showToast('Mahsulot arxivlandi');
    setRemoving(null);
    load();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mahsulotlar</h1>
          <div className="sub">Jami: {data.total}</div>
        </div>
        <button className="btn primary" onClick={() => setEditing({})}>+ Yangi mahsulot</button>
      </div>

      <div className="filters">
        {[['', 'Barchasi'], ['active', 'Faol'], ['moderation', 'Moderatsiyada'], ['rejected', 'Rad etilgan'], ['archived', 'Arxiv']].map(([s, label]) => (
          <button key={s} className={`btn sm ${status === s ? 'primary' : ''}`}
            onClick={() => { setStatus(s); setPage(1); }}>{label}</button>
        ))}
        <input className="input" placeholder="Qidirish…" value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())} />
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Mahsulot</th><th>Narx</th><th>Ombor</th><th>Sotilgan</th><th>Reyting</th><th>Holat</th><th /></tr>
          </thead>
          <tbody>
            {data.products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {p.image && <img className="thumb" src={p.image} alt="" />}
                    <div>
                      <strong>{p.name}</strong>
                      {p.status === 'rejected' && p.reject_reason && (
                        <div style={{ color: 'var(--critical)', fontSize: 12 }}>Sabab: {p.reject_reason}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="num">
                  {fmtSum(p.price)}
                  {p.old_price ? <div><s style={{ color: 'var(--muted)', fontSize: 12 }}>{fmtSum(p.old_price)}</s></div> : null}
                </td>
                <td className="num" style={{ color: p.stock <= 5 ? 'var(--critical)' : 'inherit' }}>{p.stock}</td>
                <td className="num">{p.sold_count}</td>
                <td className="num">⭐ {p.rating || '—'}</td>
                <td><Badge kind="product" value={p.status} /></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn sm" onClick={() => setEditing(p)}>Tahrirlash</button>{' '}
                  {p.status !== 'archived' && (
                    <button className="btn sm danger" onClick={() => setRemoving(p)}>Arxivlash</button>
                  )}
                </td>
              </tr>
            ))}
            {data.products.length === 0 && <tr><td colSpan={7} className="empty">Mahsulot yo'q — birinchisini qo'shing!</td></tr>}
          </tbody>
        </table>
        <Pagination page={page} pages={data.pages} onPage={setPage} />
      </div>

      {editing !== null && (
        <ProductModal product={editing} cats={cats} onClose={() => setEditing(null)}
          onSaved={(isNew) => {
            setEditing(null);
            showToast(isNew ? 'Mahsulot moderatsiyaga yuborildi' : 'Saqlandi');
            load();
          }} />
      )}
      {removing && (
        <Confirm title="Arxivlash" danger
          text={`"${removing.name}" sotuvdan olinadi (buyurtmalar tarixi saqlanadi). Davom etasizmi?`}
          onOk={remove} onClose={() => setRemoving(null)} />
      )}
      {toast}
    </>
  );
}

function ProductModal({ product, cats, onClose, onSaved }) {
  const isNew = !product.id;
  const [form, setForm] = useState({
    name: product.name || '',
    name_ru: product.name_ru || '',
    category_id: product.category_id || '',
    price: product.price || '',
    old_price: product.old_price || '',
    stock: product.stock ?? '',
    description: product.description || '',
    description_ru: product.description_ru || '',
  });
  const [images, setImages] = useState(product.images || []);
  const [attrs, setAttrs] = useState(Object.entries(product.attributes || {}));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const uploadFiles = async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Yuklashda xatolik');
      setImages([...images, ...d.urls]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const save = async () => {
    setError('');
    setBusy(true);
    try {
      const body = {
        ...form,
        category_id: Number(form.category_id),
        price: Number(form.price),
        old_price: form.old_price ? Number(form.old_price) : null,
        stock: Number(form.stock),
        images,
        attributes: Object.fromEntries(attrs.filter(([k, v]) => k.trim() && v.trim())),
      };
      if (isNew) await api('/seller/products', { method: 'POST', body });
      else await api(`/seller/products/${product.id}`, { method: 'PATCH', body });
      onSaved(isNew);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={isNew ? 'Yangi mahsulot' : 'Mahsulotni tahrirlash'} onClose={onClose}>
      {error && <div className="form-error">{error}</div>}
      {isNew && (
        <p style={{ color: 'var(--ink-2)', fontSize: 13, marginTop: 0 }}>
          Yangi mahsulot admin moderatsiyasidan so'ng sotuvga chiqadi.
        </p>
      )}
      <div className="field">
        <label>Nomi (o'zbekcha)</label>
        <input value={form.name} onChange={set('name')} autoFocus placeholder="Mahsulot nomi" />
      </div>
      <div className="field">
        <label>Название (ruscha — mobil ilovada rus tilini tanlaganlar uchun, ixtiyoriy)</label>
        <input value={form.name_ru} onChange={set('name_ru')} placeholder="Название товара" />
      </div>
      <div className="field">
        <label>Kategoriya</label>
        <select value={form.category_id} onChange={set('category_id')}>
          <option value="">— Tanlang —</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>{c.depth ? '  — ' : ''}{c.name}</option>
          ))}
        </select>
      </div>
      <div className="field row">
        <div style={{ flex: 1 }}>
          <label>Narx (so'm)</label>
          <input type="number" value={form.price} onChange={set('price')} />
        </div>
        <div style={{ flex: 1 }}>
          <label>Eski narx (chegirma uchun)</label>
          <input type="number" value={form.old_price} onChange={set('old_price')} placeholder="ixtiyoriy" />
        </div>
        <div style={{ width: 110 }}>
          <label>Ombor</label>
          <input type="number" value={form.stock} onChange={set('stock')} />
        </div>
      </div>
      <div className="field">
        <label>Tavsif (o'zbekcha)</label>
        <textarea value={form.description} onChange={set('description')} />
      </div>
      <div className="field">
        <label>Описание (ruscha, ixtiyoriy)</label>
        <textarea value={form.description_ru} onChange={set('description_ru')} />
      </div>

      <div className="field">
        <label>Rasmlar ({images.length}/10)</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {images.map((src, i) => (
            <div key={src + i} style={{ position: 'relative' }}>
              <img src={src} alt="" style={{ width: 76, height: 76, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border)' }} />
              <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'var(--critical)', color: '#fff', fontSize: 12, lineHeight: 1 }}>
                ✕
              </button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple onChange={uploadFiles} disabled={uploading} />
        {uploading && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>Yuklanmoqda…</div>}
        <input className="input" style={{ marginTop: 8 }} placeholder="Yoki rasm URL kiriting va Enter bosing"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              e.preventDefault();
              setImages([...images, e.target.value.trim()]);
              e.target.value = '';
            }
          }} />
      </div>

      <div className="field">
        <label>Xususiyatlar</label>
        {attrs.map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <input className="input" placeholder="Nomi (Rang)" value={k}
              onChange={(e) => setAttrs(attrs.map((a, j) => (j === i ? [e.target.value, a[1]] : a)))} />
            <input className="input" placeholder="Qiymati (Qora)" value={v}
              onChange={(e) => setAttrs(attrs.map((a, j) => (j === i ? [a[0], e.target.value] : a)))} />
            <button type="button" className="btn sm danger" onClick={() => setAttrs(attrs.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button type="button" className="btn sm" onClick={() => setAttrs([...attrs, ['', '']])}>+ Xususiyat</button>
      </div>

      <div className="actions">
        <button className="btn" onClick={onClose}>Bekor qilish</button>
        <button className="btn primary" onClick={save} disabled={busy}>
          {busy ? 'Saqlanmoqda…' : 'Saqlash'}
        </button>
      </div>
    </Modal>
  );
}
