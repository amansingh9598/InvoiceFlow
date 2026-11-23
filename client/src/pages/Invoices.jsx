import { useEffect, useState, useCallback } from 'react';
import { Download, Send, CheckCircle2 } from 'lucide-react';
import api, { errMsg } from '../api';
import { inr, fmtDate } from '../utils';

const tabs = ['all', 'sent', 'overdue', 'paid'];

export default function Invoices() {
  const [list, setList] = useState(null);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(() => {
    api.get('/invoices', { params: { status, q } }).then((r) => setList(r.data)).catch((e) => setToast(errMsg(e)));
  }, [status, q]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const say = (m) => { setToast(m); setTimeout(() => setToast(''), 3500); };

  const download = async (inv) => {
    try {
      const r = await api.get(`/invoices/${inv._id}/pdf`, { responseType: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(r.data);
      a.download = `${inv.invoiceNo}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) { say('Could not create the PDF. Check that Puppeteer is installed.'); }
  };
  const resend = async (inv) => { try { const r = await api.post(`/invoices/${inv._id}/resend`); say(r.data.emailStatus === 'sent' ? `Emailed to ${inv.customerEmail}` : `Email status: ${r.data.emailStatus}`); load(); } catch (e) { say(errMsg(e)); } };
  const markPaid = async (inv) => { try { await api.patch(`/invoices/${inv._id}/paid`); say(`${inv.invoiceNo} marked as paid`); load(); } catch (e) { say(errMsg(e)); } };

  return (
    <>
      <div className="page-head"><div><h1>Invoices</h1><p className="muted">Download, resend or mark as paid.</p></div></div>
      {toast && <div className="toast" role="status">{toast}</div>}
      <div className="toolbar">
        <div className="tabs" role="tablist">
          {tabs.map((t) => <button key={t} role="tab" aria-selected={status === t} className={status === t ? 'on' : ''} onClick={() => setStatus(t)}>{t}</button>)}
        </div>
        <input className="search" placeholder="Search invoice or customer" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search invoices" />
      </div>

      <section className="panel">
        {!list ? <p className="muted">Loading…</p> : list.length === 0 ? <p className="muted">No invoices match. Try another filter, or add a new order.</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Invoice</th><th>Customer</th><th>Due</th><th>GST</th><th>Total</th><th>Email</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {list.map((i) => (
                  <tr key={i._id}>
                    <td data-label="Invoice"><b>{i.invoiceNo}</b></td>
                    <td data-label="Customer">{i.customerName}<small>{i.customerEmail}</small></td>
                    <td data-label="Due">{fmtDate(i.dueDate)}</td>
                    <td data-label="GST">{inr(i.totalTax)}<small>{i.isInterState ? 'IGST' : 'CGST + SGST'}</small></td>
                    <td data-label="Total"><b>{inr(i.total)}</b></td>
                    <td data-label="Email"><span className={`pill mail-${i.emailStatus}`}>{i.emailStatus}</span></td>
                    <td data-label="Status"><span className={`pill ${i.status}`}>{i.status}</span></td>
                    <td className="actions">
                      <button className="icon-btn" title="Download PDF" aria-label="Download PDF" onClick={() => download(i)}><Download size={18} /></button>
                      <button className="icon-btn" title="Resend email" aria-label="Resend email" onClick={() => resend(i)}><Send size={18} /></button>
                      {i.status !== 'paid' && <button className="icon-btn ok" title="Mark as paid" aria-label="Mark as paid" onClick={() => markPaid(i)}><CheckCircle2 size={18} /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
