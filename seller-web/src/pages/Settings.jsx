import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Badge, useToast } from '../components/ui.jsx';

export default function Settings() {
  const { shop, setShop, user } = useAuth();
  const [name, setName] = useState(shop?.name || '');
  const [description, setDescription] = useState(shop?.description || '');
  const [logo, setLogo] = useState(shop?.logo || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [toast, showToast] = useToast();

  const saveShop = async () => {
    try {
      const d = await api('/seller/shop', { method: 'PATCH', body: { name, description, logo } });
      setShop(d.shop);
      showToast('Saqlandi');
    } catch (e) {
      showToast(e.message);
    }
  };

  const changePassword = async () => {
    try {
      await api('/auth/change-password', { method: 'POST', body: { oldPassword, newPassword } });
      setOldPassword('');
      setNewPassword('');
      showToast('Parol almashtirildi');
    } catch (e) {
      showToast(e.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Do'kon sozlamalari</h1>
          <div className="sub">Holat: <Badge kind="shop" value={shop?.status} /></div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <h3>Do'kon ma'lumotlari</h3>
          <div className="field">
            <label>Do'kon nomi</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Tavsif</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Do'koningiz haqida qisqacha…" />
          </div>
          <div className="field">
            <label>Logo URL</label>
            <input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://…" />
            {logo && <img src={logo} alt="" style={{ marginTop: 8, width: 88, height: 88, borderRadius: 12, objectFit: 'cover' }} />}
          </div>
          <button className="btn primary" onClick={saveShop}>Saqlash</button>
        </div>

        <div className="card card-pad">
          <h3>Hisob</h3>
          <div className="field">
            <label>Email</label>
            <input value={user?.email || ''} disabled />
          </div>
          <div className="field">
            <label>Joriy parol</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          </div>
          <div className="field">
            <label>Yangi parol (kamida 6 belgi)</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <button className="btn" onClick={changePassword} disabled={!oldPassword || newPassword.length < 6}>
            Parolni almashtirish
          </button>
        </div>
      </div>
      {toast}
    </>
  );
}
