import { Router } from 'express';
import Invoice from '../models/Invoice.js';
import auth from '../middleware/auth.js';
import { generateInvoicePDF } from '../services/pdf.js';
import { deliver } from '../services/invoiceService.js';

const router = Router();
router.use(auth);

const own = (req) => Invoice.findOne({ _id: req.params.id, user: req.user._id });

router.get('/', async (req, res) => {
  const { status, q } = req.query;
  const filter = { user: req.user._id };
  if (status && status !== 'all') filter.status = status;
  if (q) filter.$or = [{ invoiceNo: new RegExp(q, 'i') }, { customerName: new RegExp(q, 'i') }];
  res.json(await Invoice.find(filter).sort('-createdAt').limit(200));
});

router.get('/:id', async (req, res) => {
  const inv = await own(req);
  inv ? res.json(inv) : res.status(404).json({ message: 'Invoice not found.' });
});

router.get('/:id/pdf', async (req, res) => {
  const inv = await own(req);
  if (!inv) return res.status(404).json({ message: 'Invoice not found.' });
  const pdf = await generateInvoicePDF(inv, req.user);
  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${inv.invoiceNo}.pdf"` });
  res.send(pdf);
});

router.post('/:id/resend', async (req, res) => {
  const inv = await own(req);
  if (!inv) return res.status(404).json({ message: 'Invoice not found.' });
  await deliver(inv, req.user);
  res.json(inv);
});

router.patch('/:id/paid', async (req, res) => {
  const inv = await own(req);
  if (!inv) return res.status(404).json({ message: 'Invoice not found.' });
  inv.status = 'paid';
  inv.paidAt = new Date();
  await inv.save();
  res.json(inv);
});

export default router;
