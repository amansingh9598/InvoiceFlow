# InvoiceFlow – Invoice Automation (MERN)

Order aate hi invoice banta hai, GST calculate hota hai, aur customer ko PDF email ho jaata hai.

## Tech stack
| Layer | Tools |
|---|---|
| Database | MongoDB + Mongoose |
| Backend | Node.js, Express, JWT auth, **node-cron**, **Nodemailer**, **Puppeteer** (PDF) |
| Frontend | React (Vite), React Router, **Recharts**, lucide-react |

## Setup
Requirements: Node 18+, MongoDB running locally (or an Atlas URI).

```bash
# 1. Backend
cd server
npm install              # also downloads Chromium for Puppeteer
cp .env.example .env     # edit MONGO_URI, JWT_SECRET, SMTP_*
npm run seed             # optional demo data (demo@invoiceflow.in / demo123)
npm run dev              # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev              # http://localhost:5173
```

Gmail SMTP: turn on 2-step verification, create an **App Password**, put it in `SMTP_PASS`.
Without SMTP details the app still works; emails are marked "skipped".

## Automation flow
`POST /api/orders` → save order → `gst.js` calculates CGST+SGST (same state) or IGST (other state) → invoice number `INV-YYYY-0001` → Puppeteer renders PDF → Nodemailer emails it.

## node-cron jobs (`server/jobs/cron.js`)
- **9:00 AM daily**: mark unpaid past-due invoices as overdue and email a reminder every 3 days.
- **Every 30 min**: retry invoice emails that failed (max 3 attempts).

## API
| Method | Route | Purpose |
|---|---|---|
| POST | /api/auth/register, /login | Auth |
| GET/PUT | /api/auth/me, /profile | Business profile |
| POST/GET | /api/orders | Create order (auto-invoice) / list |
| GET | /api/invoices?status=&q= | List and filter |
| GET | /api/invoices/:id/pdf | Download PDF |
| POST | /api/invoices/:id/resend | Re-email |
| PATCH | /api/invoices/:id/paid | Mark paid |
| GET | /api/dashboard | Totals and chart data |

## Pages
Landing (`/`), Login/Register, Dashboard (revenue, GST, status charts), New order (live GST preview), Invoices (filter, download, resend, mark paid), Business profile. Responsive for mobile, tablet and laptop.
