import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Calculator, FileDown, BellRing, BarChart3, Clock, Menu, X } from 'lucide-react';
import Logo from '../components/Logo';

const features = [
  { icon: Calculator, title: 'GST worked out for you', text: 'CGST + SGST when the customer is in your state, IGST when they are not. Rates of 0, 5, 12, 18 and 28% per item.' },
  { icon: FileDown, title: 'A proper PDF, every time', text: 'A clean A4 tax invoice with your GSTIN, HSN codes and tax summary, created the instant the order is saved.' },
  { icon: Mail, title: 'Emailed to the customer', text: 'The PDF goes to your customer’s inbox automatically. If an email fails, we retry it every 30 minutes.' },
  { icon: BellRing, title: 'Polite payment reminders', text: 'Overdue invoices are flagged each morning and a reminder is sent every three days until you mark them paid.' },
  { icon: BarChart3, title: 'Know where you stand', text: 'Monthly revenue, GST collected, paid vs. pending, all on one dashboard that works on your phone.' },
];

const steps = [
  ['Add the order', 'Enter the customer, items, quantity and price.'],
  ['We do the invoice', 'GST is calculated and a numbered PDF is generated.'],
  ['Customer gets it', 'The invoice lands in their inbox within seconds.'],
  ['You track payment', 'Mark it paid, or let reminders do the chasing.'],
];

export default function Landing() {
  const [open, setOpen] = useState(false);
  return (
    <div className="landing">
      <header className="l-nav">
        <div className="wrap l-nav-in">
          <Logo />
          <nav className={`l-links ${open ? 'open' : ''}`}>
            <a href="#features" onClick={() => setOpen(false)}>Features</a>
            <a href="#how" onClick={() => setOpen(false)}>How it works</a>
            <a href="#gst" onClick={() => setOpen(false)}>GST</a>
            <Link to="/login" className="btn ghost">Log in</Link>
            <Link to="/register" className="btn primary">Start free</Link>
          </nav>
          <button className="icon-btn l-burger" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section className="hero wrap">
        <div className="hero-copy">
          <h1>Order aaya.<br />Invoice gaya.</h1>
          <p>InvoiceFlow turns every order into a GST-ready PDF invoice and emails it to your customer, so you stop typing invoices at the end of the day.</p>
          <div className="hero-cta">
            <Link to="/register" className="btn primary lg">Create free account</Link>
            <a href="#how" className="btn ghost lg">See how it works</a>
          </div>
          <p className="fine">Built for Indian shops, agencies and freelancers.</p>
        </div>

        <div className="demo" aria-label="Example of an order becoming an invoice">
          <div className="demo-order">
            <span className="chip">New order</span>
            <b>Rohit Verma</b>
            <span>2 × LED Monitor 24″ · Uttar Pradesh</span>
          </div>
          <div className="demo-invoice">
            <div className="di-head"><b>INV-2026-0042</b><span className="pill sent">Sent</span></div>
            <div className="di-row"><span>Subtotal</span><span>₹17,000.00</span></div>
            <div className="di-row"><span>CGST 9%</span><span>₹1,530.00</span></div>
            <div className="di-row"><span>SGST 9%</span><span>₹1,530.00</span></div>
            <div className="di-row total"><span>Total</span><span>₹20,060.00</span></div>
          </div>
          <div className="demo-mail"><Mail size={16} /> rohit@example.com received the PDF</div>
        </div>
      </section>

      <section id="features" className="section wrap">
        <h2>Everything between “order placed” and “payment received”</h2>
        <div className="feat-list">
          {features.map(({ icon: Icon, title, text }) => (
            <div className="feat" key={title}>
              <Icon size={22} />
              <div><h3>{title}</h3><p>{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="section alt">
        <div className="wrap">
          <h2>How it works</h2>
          <ol className="steps">
            {steps.map(([t, d], i) => (
              <li key={t}><span className="step-n">{i + 1}</span><h3>{t}</h3><p>{d}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section id="gst" className="section wrap gst">
        <div>
          <h2>CGST, SGST or IGST? We pick the right one.</h2>
          <p>InvoiceFlow compares your state with the customer’s state and applies the correct tax split on every line.</p>
        </div>
        <div className="gst-compare">
          <div><h3>Same state</h3><p className="muted">Noida → Lucknow</p><p>18% GST becomes <b>9% CGST</b> + <b>9% SGST</b></p></div>
          <div><h3>Different state</h3><p className="muted">Noida → Mumbai</p><p>18% GST becomes <b>18% IGST</b></p></div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <Clock size={28} />
          <h2>Get your evenings back.</h2>
          <Link to="/register" className="btn accent lg">Create free account</Link>
        </div>
      </section>

      <footer className="l-foot wrap">
        <Logo />
        <span>© {new Date().getFullYear()} InvoiceFlow. Made in India.</span>
      </footer>
    </div>
  );
}
