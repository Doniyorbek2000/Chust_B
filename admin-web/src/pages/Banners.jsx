import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Modal, useToast } from '../components/ui.jsx';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [editing, setEditing] = useState(null);
  const [toast, showToast] = useToast();

  const load = () => api('/admin/banners').then((d) => setBanners(d.banners)).catch((e) => showToast(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line

  const toggle = async (b) => {
    await api(`/admin/banners/${b.id}`, { method: 'PATCH', body: { active: !b.active } });
    load();
  };
  const remove = async (b) => {
    await api(`/admin/banners/${b.id}`, { method: 'DELETE' });
    showToast("O'chirildi");
    load();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Bannerlar</h1>
          <div className="sub">Mobil ilova bosh sahifasidagi reklama bannerlari</div>
        </div>
        <button className="btn primary" onClick={() => setEditing({})}>+ Yangi banner</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Banner</th><th>Havola</th><th>Tartib</th><th>Holat</th><th /></tr></thead>
          <tbody>
            {banners.map((b) => (
              <tr key={b.id} style={{ opacity: b.active ? 1 : 0.5 }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={b.image} alt="" style={{ width: 120, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                    <strong>{b.title}</strong>
                  </div>
                </td>
                <td>{{ none: '—', product: `Mahsulot #${b.link_id}`, category: `Kategoriya #${b.link_id}` }[b.link_type]}</td>
                <td className="num">{b.sort}</td>
                <td>{b.active ? <span className="badge green">Faol</span> : <span className="badge gray">O'chirilgan</span>}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn sm" onClick={() => setEditing(b)}>Tahrirlash</button>{' '}
                  <button className="btn sm" onClick={() => toggle(b)}>{b.active ? "O'chirish" : 'Yoqish'}</button>{' '}
                  <button className="btn sm danger" onClick={() => remove(b)}>Udalit</button>
                </td>
              </tr>
            ))}
            {banners.length === 0 && <tr><td colSpan={5} className="empty">Banner yo'q</td></tr>}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <BannerModal banner={editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); showToast('Saqlandi'); load(); }} />
      )}
      {toast}
    </>
  );
}

function BannerModal({ banner, onClose, onSaved }) {
  const isNew = !banner.id;
  const [title, setTitle] = useState(banner.title || '');
  const [image, setImage] = useState(banner.image || '');
  const [linkType, setLinkType] = useState(banner.link_type || 'none');
  const [linkId, setLinkId] = useState(banner.link_id || '');
  const [sort, setSort] = useState(banner.sort ?? 0);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    try {
      const body = {
        title, image, link_type: linkType,
        link_id: linkType === 'none' ? null : Number(linkId) || null,
        sort: Number(sort) || 0,
      };
      if (isNew) await api('/admin/banners', { method: 'POST', body });
      else await api(`/admin/banners/${banner.id}`, { method: 'PATCH', body });
      onSaved();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Modal title={isNew ? 'Yangi banner' : 'Bannerni tahrirlash'} onClose={onClose}>
      {error && <div className="form-error">{error}</div>}
      <div className="field">
        <label>Sarlavha</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </div>
      <div className="field">
        <label>Rasm URL (tavsiya: 1200×480)</label>
        <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" />
        {image && <img src={image} alt="" style={{ marginTop: 8, width: '100%', borderRadius: 8 }} />}
      </div>
      <div className="field row">
        <div style={{ flex: 1 }}>
          <label>Havola turi</label>
          <select value={linkType} onChange={(e) => setLinkType(e.target.value)}>
            <option value="none">Havolasiz</option>
            <option value="product">Mahsulotga</option>
            <option value="category">Kategoriyaga</option>
          </select>
        </div>
        {linkType !== 'none' && (
          <div style={{ flex: 1 }}>
            <label>{linkType === 'product' ? 'Mahsulot ID' : 'Kategoriya ID'}</label>
            <input type="number" value={linkId} onChange={(e) => setLinkId(e.target.value)} />
          </div>
        )}
        <div style={{ width: 100 }}>
          <label>Tartib</label>
          <input type="number" value={sort} onChange={(e) => setSort(e.target.value)} />
        </div>
      </div>
      <div className="actions">
        <button className="btn" onClick={onClose}>Bekor qilish</button>
        <button className="btn primary" onClick={save}>Saqlash</button>
      </div>
    </Modal>
  );
}
