import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';
import { STATES } from '../utils';
import Logo from '../components/Logo';

export default function Auth({ mode }) {
  const isReg = mode === 'register';
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', businessName: '', state: 'Uttar Pradesh' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      await (isReg ? register(f) : login({ email: f.email, password: f.password }));
      nav('/app');
    } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };

  return (
    <div className="auth-page">
      <aside className="auth-side">
        <Logo light />
        <h2>Order aaya. Invoice gaya.</h2>
        <p>Every order becomes a GST-ready PDF invoice in your customer’s inbox, with no typing on your side.</p>
      </aside>
      <section className="auth-main">
        <form className="auth-card" onSubmit={submit}>
          <h1>{isReg ? 'Create your account' : 'Welcome back'}</h1>
          <p className="muted">{isReg ? 'Set up in under a minute.' : 'Log in to see your invoices.'}</p>
          {err && <div className="alert error" role="alert">{err}</div>}
          {isReg && (
            <>
              <label>Your name<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>
              <label>Business name<input value={f.businessName} onChange={set('businessName')} /></label>
              <label>Your state (decides CGST/SGST or IGST)
                <select value={f.state} onChange={set('state')}>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
              </label>
            </>
          )}
          <label>Email<input type="email" required value={f.email} onChange={set('email')} autoComplete="email" /></label>
          <label>Password<input type="password" required minLength={6} value={f.password} onChange={set('password')} autoComplete={isReg ? 'new-password' : 'current-password'} /></label>
          <button className="btn primary block" disabled={busy}>{busy ? 'Please wait…' : isReg ? 'Create account' : 'Log in'}</button>
          <p className="muted center">
            {isReg ? <>Already have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}
          </p>
        </form>
      </section>
    </div>
  );
}
