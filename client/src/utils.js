export const STATES = ['Andhra Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];
export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const inrShort = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// Same rule as the server, used only for the live preview on the New order page
export function previewGST(items, sellerState, buyerState) {
  const subtotal = r2(items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0));
  const tax = r2(items.reduce((s, i) => s + ((Number(i.qty) || 0) * (Number(i.price) || 0) * Number(i.gstRate)) / 100, 0));
  const inter = sellerState.trim().toLowerCase() !== buyerState.trim().toLowerCase();
  return { subtotal, tax, inter, cgst: inter ? 0 : r2(tax / 2), sgst: inter ? 0 : r2(tax - r2(tax / 2)), igst: inter ? tax : 0, total: r2(subtotal + tax) };
}
