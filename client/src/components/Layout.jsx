import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus2, FileText, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import Logo from './Logo';

const links = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/new', label: 'New order', icon: FilePlus2 },
  { to: '/app/invoices', label: 'Invoices', icon: FileText },
  { to: '/app/settings', label: 'Business profile', icon: Settings },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="shell">
      <header className="topbar">
        <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
        <Logo />
      </header>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="side-head">
          <Logo light />
          <button className="icon-btn only-mobile" onClick={() => setOpen(false)} aria-label="Close menu"><X size={22} /></button>
        </div>
        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <div className="who"><b>{user.businessName || user.name}</b><span>{user.email}</span></div>
          <button className="side-logout" onClick={() => { logout(); nav('/'); }}><LogOut size={16} /> Log out</button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}
