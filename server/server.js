import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import startJobs from './jobs/cron.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import invoiceRoutes from './routes/invoices.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our side. Please try again.' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  startJobs();
  app.listen(PORT, () => console.log(`InvoiceFlow API running on http://localhost:${PORT}`));
});
