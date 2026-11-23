import { useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { STATES } from '../utils';

export default function Settings() {
  const { user, setUser } = useAuth();
  const [f, setF] = useState({ name: user.name, businessName: user.businessName, gstin: user.gstin, address: user.address, state: user.state, phone: user.phone });
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try { const { data } = await api.put('/auth/profile', f); setUser(data.user); setMsg({ ok: true, t: 'Business profile saved.' }); }
    catch (x) { setMsg({ ok: false, t: errMsg(x) }); }
  };

  return (
    <>
      <div className="page-head"><div><h1>Business profile</h1><p className="muted">These details appear on every invoice. Your state decides CGST/SGST vs IGST.</p></div></div>
      <form className="panel" onSubmit={save}>
        {msg && <div className={`alert ${msg.ok ? 'ok' : 'error'}`}>{msg.t}</div>}
        <div className="form-grid">
          <label>Your name<input value={f.name} onChange={set('name')} required /></label>
          <label>Business name<input value={f.businessName} onChange={set('businessName')} /></label>
          <label>GSTIN<input value={f.gstin} onChange={set('gstin')} maxLength={15} /></label>
          <label>Phone<input value={f.phone} onChange={set('phone')} /></label>
          <label>State<select value={f.state} onChange={set('state')}>{STATES.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label>Address<input value={f.address} onChange={set('address')} /></label>
        </div>
        <button className="btn primary">Save changes</button>
      </form>
    </>
  );
}
