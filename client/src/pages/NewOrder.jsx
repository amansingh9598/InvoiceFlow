import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { STATES, inr, previewGST } from '../utils';

const blank = () => ({ name: '', hsn: '', qty: 1, price: '', gstRate: 18 });

export default function NewOrder() {
  const { user } = useAuth();
  const [c, setC] = useState({ customerName: '', customerEmail: '', customerGstin: '', customerState: user.state, notes: '', dueInDays: 15 });
  const [items, setItems] = useState([blank()]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);

  const setCust = (k) => (e) => setC({ ...c, [k]: e.target.value });
  const setItem = (i, k, v) => setItems(items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  const g = previewGST(items, user.state, c.customerState);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const { data } = await api.post('/orders', { ...c, dueInDays: Number(c.dueInDays), items: items.map((i) => ({ ...i, qty: Number(i.qty), price: Number(i.price), gstRate: Number(i.gstRate) })) });
      setDone(data.invoice);
    } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };

  if (done) {
    const msg = { sent: `The PDF was emailed to ${done.customerEmail}.`, skipped: 'Email was skipped because SMTP is not set up yet. Add SMTP details in server/.env.', failed: 'The email could not be sent. We will retry automatically every 30 minutes.' }[done.emailStatus];
    return (
      <div className="panel success">
        <CheckCircle2 size={40} color="#1E9E6A" />
        <h1>Invoice {done.invoiceNo} created</h1>
        <p>Total {inr(done.total)} including {inr(done.totalTax)} GST.</p>
        <p className={`alert ${done.emailStatus === 'sent' ? 'ok' : 'warn'}`}>{msg}</p>
        <div className="row">
          <button className="btn primary" onClick={() => { setDone(null); setItems([blank()]); setC({ ...c, customerName: '', customerEmail: '', customerGstin: '', notes: '' }); }}>Add another order</button>
          <Link className="btn ghost" to="/app/invoices">View invoices</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-head"><div><h1>New order</h1><p className="muted">Saving the order creates the invoice and emails it.</p></div></div>
      <form className="order-grid" onSubmit={submit}>
        <div>
          <section className="panel">
            <h2>Customer</h2>
            {err && <div className="alert error" role="alert">{err}</div>}
            <div className="form-grid">
              <label>Name<input required value={c.customerName} onChange={setCust('customerName')} /></label>
              <label>Email<input type="email" required value={c.customerEmail} onChange={setCust('customerEmail')} /></label>
              <label>State<select value={c.customerState} onChange={setCust('customerState')}>{STATES.map((s) => <option key={s}>{s}</option>)}</select></label>
              <label>GSTIN (optional)<input value={c.customerGstin} onChange={setCust('customerGstin')} maxLength={15} /></label>
            </div>
          </section>

          <section className="panel">
            <h2>Items</h2>
            {items.map((it, i) => (
              <div className="item-row" key={i}>
                <label className="grow">Item<input required value={it.name} onChange={(e) => setItem(i, 'name', e.target.value)} /></label>
                <label>HSN<input value={it.hsn} onChange={(e) => setItem(i, 'hsn', e.target.value)} /></label>
                <label>Qty<input type="number" min="1" required value={it.qty} onChange={(e) => setItem(i, 'qty', e.target.value)} /></label>
                <label>Price (₹)<input type="number" min="0" step="0.01" required value={it.price} onChange={(e) => setItem(i, 'price', e.target.value)} /></label>
                <label>GST<select value={it.gstRate} onChange={(e) => setItem(i, 'gstRate', e.target.value)}>{[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}</select></label>
                {items.length > 1 && <button type="button" className="icon-btn danger" onClick={() => setItems(items.filter((_, x) => x !== i))} aria-label="Remove item"><Trash2 size={18} /></button>}
              </div>
            ))}
            <button type="button" className="btn ghost" onClick={() => setItems([...items, blank()])}><Plus size={16} /> Add item</button>
          </section>

          <section className="panel">
            <div className="form-grid">
              <label>Payment due in (days)<input type="number" min="1" value={c.dueInDays} onChange={setCust('dueInDays')} /></label>
              <label>Note on invoice<input value={c.notes} onChange={setCust('notes')} /></label>
            </div>
          </section>
        </div>

        <aside className="panel summary">
          <h2>Invoice preview</h2>
          <div className="sum-row"><span>Subtotal</span><span>{inr(g.subtotal)}</span></div>
          {g.inter ? <div className="sum-row"><span>IGST</span><span>{inr(g.igst)}</span></div> : (<><div className="sum-row"><span>CGST</span><span>{inr(g.cgst)}</span></div><div className="sum-row"><span>SGST</span><span>{inr(g.sgst)}</span></div></>)}
          <div className="sum-row total"><span>Total</span><span>{inr(g.total)}</span></div>
          <p className="muted small">{g.inter ? `Inter-state supply (${user.state} → ${c.customerState}), so IGST applies.` : 'Same-state supply, so GST is split into CGST and SGST.'}</p>
          <button className="btn primary block" disabled={busy}>{busy ? 'Creating invoice…' : 'Create invoice and email it'}</button>
        </aside>
      </form>
    </>
  );
}
