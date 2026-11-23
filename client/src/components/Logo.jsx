export default function Logo({ light }) {
  return (
    <span className="logo" style={light ? { color: '#fff' } : undefined}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="7" fill="#3340D8" />
        <path d="M8 8h9l3 3v9H8z" fill="#fff" />
        <path d="M11 14h6M11 17h4" stroke="#3340D8" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="21" cy="8" r="3.2" fill="#F4A62A" />
      </svg>
      InvoiceFlow
    </span>
  );
}
