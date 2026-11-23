import nodemailer from "nodemailer";
import { generateInvoicePDF } from "./pdf.js";

const inr = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const smtpReady = () =>
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

const wrap = (
  title,
  body,
) => `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#111936">
  <h2 style="color:#3340D8;margin-bottom:4px">${title}</h2>${body}
  <p style="color:#5B6485;font-size:12px;margin-top:28px">Sent with InvoiceFlow</p></div>`;

/** Returns 'sent' | 'skipped'. Throws on SMTP failure. */
export async function sendInvoiceEmail(
  invoice,
  seller,
  { reminder = false } = {},
) {
  if (!smtpReady()) {
    console.log(
      `[mail skipped] SMTP not configured. Would send ${invoice.invoiceNo} to ${invoice.customerEmail}`,
    );
    return "skipped";
  }
  const pdf = await generateInvoicePDF(invoice, seller);
  const biz = seller.businessName || seller.name;
  const due = new Date(invoice.dueDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const html = reminder
    ? wrap(
        "Payment reminder",
        `<p>Hi ${invoice.customerName},</p><p>Invoice <b>${invoice.invoiceNo}</b> for <b>${inr(invoice.total)}</b> was due on ${due}. The PDF is attached. Please ignore this message if you have already paid.</p><p>Thank you,<br>${biz}</p>`,
      )
    : wrap(
        `Invoice ${invoice.invoiceNo}`,
        `<p>Hi ${invoice.customerName},</p><p>Thanks for your order. Your GST invoice for <b>${inr(invoice.total)}</b> is attached.</p><p>Due date: <b>${due}</b></p><p>Thank you,<br>${biz}</p>`,
      );

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: invoice.customerEmail,
    replyTo: seller.email,
    subject: reminder
      ? `Reminder: invoice ${invoice.invoiceNo} from ${biz}`
      : `Invoice ${invoice.invoiceNo} from ${biz}`,
    html,
    attachments: [
      {
        filename: `${invoice.invoiceNo}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });
  return "sent";
}
