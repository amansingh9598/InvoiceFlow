import User from '../models/User.js';
import Invoice from '../models/Invoice.js';
import { calcInvoice } from './gst.js';
import { sendInvoiceEmail } from './mailer.js';

/** Order -> Invoice -> GST -> PDF -> Email. The core automation. */
export async function createInvoiceForOrder(order, seller) {
  const gst = calcInvoice(order.items, seller.state, order.customerState);
  const { invoiceSeq } = await User.findByIdAndUpdate(seller._id, { $inc: { invoiceSeq: 1 } }, { new: true });
  const invoiceNo = `INV-${new Date().getFullYear()}-${String(invoiceSeq).padStart(4, '0')}`;
  const dueDate = new Date(Date.now() + (order.dueInDays || 15) * 86400000);

  const invoice = await Invoice.create({
    user: seller._id,
    order: order._id,
    invoiceNo,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerGstin: order.customerGstin,
    customerState: order.customerState,
    notes: order.notes,
    dueDate,
    ...gst,
  });

  order.invoice = invoice._id;
  await order.save();

  await deliver(invoice, seller);
  return invoice;
}

export async function deliver(invoice, seller) {
  try {
    invoice.emailStatus = await sendInvoiceEmail(invoice, seller);
  } catch (err) {
    console.error('Email failed:', err.message);
    invoice.emailStatus = 'failed';
    invoice.emailRetries += 1;
  }
  await invoice.save();
  return invoice;
}
