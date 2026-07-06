import { useEffect, useState } from 'react';
import { api, fmtDate } from '../api.js';
import { Badge, Pagination, Confirm, useToast } from '../components/ui.jsx';

const ROLE_LABEL = { buyer: 'Haridor', seller: 'Sotuvchi', admin: 'Admin' };

export default function Users() {
  const [data, setData] = useState({ users: [], pages: 1 });
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);
  const [toast, showToast] = useToast();

  const load = () => {
    const params = new URLSearchParams({ page, ...(q && { q }), ...(role && { role }) });
    api(`/admin/users?${params}`).then(setData).catch((e) => showToast(e.message));
  };
  useEffect(load, [page, role]); // eslint-disable-line

  const toggleStatus = async (u) => {
    const status = u.status === 'active' ? 'blocked' : 'active';
    await api(`/admin/users/${u.id}/status`, { method: 'PATCH', body: { status } });
    showToast(status === 'blocked' ? 'Foydalanuvchi bloklandi' : 'Blokdan chiqarildi');
    setConfirm(null);
    load();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Foydalanuvchilar</h1>
          <div className="sub">Jami: {data.total ?? 0}</div>
        </div>
      </div>

      <div className="filters">
        <input className="input" placeholder="Ism yoki email bo'yicha qidirish…" value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())} />
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="input">
          <option value="">Barcha rollar</option>
          <option value="buyer">Haridor</option>
          <option value="seller">Sotuvchi</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn" onClick={() => { setPage(1); load(); }}>Qidirish</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Ism</th><th>Email</th><th>Telefon</th><th>Rol</th><th>Holat</th><th>Ro'yxatdan o'tgan</th><th /></tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{u.phone || '—'}</td>
                <td>{ROLE_LABEL[u.role]}</td>
                <td><Badge kind="user" value={u.status} /></td>
                <td>{fmtDate(u.created_at)}</td>
                <td style={{ textAlign: 'right' }}>
                  {u.role !== 'admin' && (
                    <button className={`btn sm ${u.status === 'active' ? 'danger' : ''}`}
                      onClick={() => setConfirm(u)}>
                      {u.status === 'active' ? 'Bloklash' : 'Blokdan chiqarish'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {data.users.length === 0 && <tr><td colSpan={7} className="empty">Foydalanuvchi topilmadi</td></tr>}
          </tbody>
        </table>
        <Pagination page={page} pages={data.pages} onPage={setPage} />
      </div>

      {confirm && (
        <Confirm
          title={confirm.status === 'active' ? 'Bloklash' : 'Blokdan chiqarish'}
          text={`"${confirm.name}" (${confirm.email}) hisobini ${confirm.status === 'active' ? 'bloklamoqchimisiz' : 'blokdan chiqarmoqchimisiz'}?`}
          danger={confirm.status === 'active'}
          onOk={() => toggleStatus(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
      {toast}
    </>
  );
}
