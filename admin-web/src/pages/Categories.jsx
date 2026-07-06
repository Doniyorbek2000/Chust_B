import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Modal, useToast } from '../components/ui.jsx';

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null); // null | {} (yangi) | category
  const [toast, showToast] = useToast();

  const load = () => api('/admin/categories').then((d) => setCats(d.categories)).catch((e) => showToast(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line

  const roots = cats.filter((c) => !c.parent_id);
  const childrenOf = (id) => cats.filter((c) => c.parent_id === id);

  const remove = async (c) => {
    try {
      await api(`/admin/categories/${c.id}`, { method: 'DELETE' });
      showToast("O'chirildi");
      load();
    } catch (e) {
      showToast(e.message);
    }
  };

  const toggle = async (c) => {
    await api(`/admin/categories/${c.id}`, { method: 'PATCH', body: { active: !c.active } });
    load();
  };

  const Row = ({ c, depth }) => (
    <tr key={c.id} style={{ opacity: c.active ? 1 : 0.5 }}>
      <td style={{ paddingLeft: 14 + depth * 26 }}>
        {c.icon} <strong>{c.name}</strong>
        {depth === 0 && <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: 12 }}>({childrenOf(c.id).length} ta bo'lim)</span>}
      </td>
      <td className="num">{c.sort}</td>
      <td>{c.active ? <span className="badge green">Faol</span> : <span className="badge gray">O'chirilgan</span>}</td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <button className="btn sm" onClick={() => setEditing(c)}>Tahrirlash</button>{' '}
        <button className="btn sm" onClick={() => toggle(c)}>{c.active ? "O'chirish" : 'Yoqish'}</button>{' '}
        <button className="btn sm danger" onClick={() => remove(c)}>Udalit</button>
      </td>
    </tr>
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Kategoriyalar</h1>
          <div className="sub">Katalog tuzilmasi — bo'lim va ichki bo'limlar</div>
        </div>
        <button className="btn primary" onClick={() => setEditing({})}>+ Yangi kategoriya</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Nomi</th><th>Tartib</th><th>Holat</th><th /></tr></thead>
          <tbody>
            {roots.map((r) => [
              <Row key={r.id} c={r} depth={0} />,
              ...childrenOf(r.id).map((ch) => <Row key={ch.id} c={ch} depth={1} />),
            ])}
            {roots.length === 0 && <tr><td colSpan={4} className="empty">Kategoriya yo'q</td></tr>}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <CategoryModal
          category={editing}
          roots={roots}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); showToast('Saqlandi'); load(); }}
        />
      )}
      {toast}
    </>
  );
}

function CategoryModal({ category, roots, onClose, onSaved }) {
  const isNew = !category.id;
  const [name, setName] = useState(category.name || '');
  const [icon, setIcon] = useState(category.icon || '');
  const [parentId, setParentId] = useState(category.parent_id || '');
  const [sort, setSort] = useState(category.sort ?? 0);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    try {
      const body = { name, icon: icon || null, parent_id: parentId ? Number(parentId) : null, sort: Number(sort) || 0 };
      if (isNew) await api('/admin/categories', { method: 'POST', body });
      else await api(`/admin/categories/${category.id}`, { method: 'PATCH', body });
      onSaved();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Modal title={isNew ? 'Yangi kategoriya' : 'Kategoriyani tahrirlash'} onClose={onClose}>
      {error && <div className="form-error">{error}</div>}
      <div className="field">
        <label>Nomi</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Elektronika" autoFocus />
      </div>
      <div className="field">
        <label>Belgi (emoji)</label>
        <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="📱" />
      </div>
      <div className="field">
        <label>Ota kategoriya</label>
        <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">— Asosiy bo'lim —</option>
          {roots.filter((r) => r.id !== category.id).map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Tartib raqami</label>
        <input type="number" value={sort} onChange={(e) => setSort(e.target.value)} />
      </div>
      <div className="actions">
        <button className="btn" onClick={onClose}>Bekor qilish</button>
        <button className="btn primary" onClick={save}>Saqlash</button>
      </div>
    </Modal>
  );
}
