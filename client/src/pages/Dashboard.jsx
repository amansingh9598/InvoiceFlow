import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { IndianRupee, Receipt, Clock3, AlertTriangle } from 'lucide-react';
import api, { errMsg } from '../api';
import { inr, inrShort, fmtDate } from '../utils';

const COLORS = { paid: '#1E9E6A', sent: '#3340D8', overdue: '#D6403A' };

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.get('/dashboard').then((r) => setD(r.data)).catch((e) => setErr(errMsg(e))); }, []);

  if (err) return <div className="alert error">{err}</div>;
  if (!d) return <div className="muted">Loading dashboard…</div>;
  const t = d.totals;
  const empty = t.count === 0;

  const stats = [
    { label: 'Billed in total', value: inrShort(t.billed), icon: IndianRupee, tone: 'indigo' },
    { label: 'Received', value: inrShort(t.paid), icon: Receipt, tone: 'green' },
    { label: 'Waiting for payment', value: inrShort(t.pending), icon: Clock3, tone: 'saffron' },
    { label: `Overdue (${d.overdue.count})`, value: inrShort(d.overdue.amount), icon: AlertTriangle, tone: 'red' },
  ];

  return (
    <>
      <div className="page-head">
        <div><h1>Dashboard</h1><p className="muted">{t.count} invoices · {inrShort(t.gst)} GST collected</p></div>
        <Link to="/app/new" className="btn primary">New order</Link>
      </div>

      {empty && <div className="alert info">No invoices yet. <Link to="/app/new">Add your first order</Link> and the invoice will be created and emailed automatically.</div>}

      <div className="stats">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div className={`stat ${tone}`} key={label}>
            <Icon size={20} />
            <div><span>{label}</span><b>{value}</b></div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <section className="panel">
          <h2>Revenue, last 6 months</h2>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.monthly} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E6EF" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? v / 1000 + 'k' : v)} />
                <Tooltip formatter={(v) => inr(v)} />
                <Bar dataKey="revenue" name="Revenue" fill="#3340D8" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <h2>Invoice status</h2>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={d.byStatus} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={3}>
                  {d.byStatus.map((s) => <Cell key={s.name} fill={COLORS[s.name]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="panel">
        <h2>GST collected per month</h2>
        <div className="chart short">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={d.monthly} margin={{ left: -10, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E6EF" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => inr(v)} />
              <Line type="monotone" dataKey="gst" name="GST" stroke="#F4A62A" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><h2>Recent invoices</h2><Link to="/app/invoices">View all</Link></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {d.recent.map((i) => (
                <tr key={i._id}>
                  <td data-label="Invoice"><b>{i.invoiceNo}</b></td>
                  <td data-label="Customer">{i.customerName}</td>
                  <td data-label="Date">{fmtDate(i.issueDate)}</td>
                  <td data-label="Total">{inr(i.total)}</td>
                  <td data-label="Status"><span className={`pill ${i.status}`}>{i.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
