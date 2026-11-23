const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const norm = (s = '') => s.trim().toLowerCase();

/**
 * GST rule:
 *  - Seller state == buyer state  -> intra-state: CGST (half) + SGST (half)
 *  - Different states             -> inter-state: IGST (full)
 */
export function calcInvoice(items, sellerState, buyerState) {
  const lines = items.map((i) => {
    const taxable = r2(Number(i.qty) * Number(i.price));
    const tax = r2((taxable * Number(i.gstRate)) / 100);
    return { name: i.name, hsn: i.hsn || '', qty: Number(i.qty), price: Number(i.price), gstRate: Number(i.gstRate), taxable, tax };
  });
  const subtotal = r2(lines.reduce((s, l) => s + l.taxable, 0));
  const totalTax = r2(lines.reduce((s, l) => s + l.tax, 0));
  const isInterState = norm(sellerState) !== norm(buyerState);
  const cgst = isInterState ? 0 : r2(totalTax / 2);
  const sgst = isInterState ? 0 : r2(totalTax - cgst);
  const igst = isInterState ? totalTax : 0;
  return { lines, subtotal, totalTax, cgst, sgst, igst, isInterState, total: r2(subtotal + totalTax) };
}
