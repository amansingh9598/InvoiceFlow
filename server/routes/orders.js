import { Router } from 'express';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import auth from '../middleware/auth.js';
import { createInvoiceForOrder } from '../services/invoiceService.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('invoice', 'invoiceNo total status').sort('-createdAt').limit(100);
  res.json(orders);
});

// Place an order -> invoice + GST + email happen automatically
router.post('/', async (req, res) => {
  try {
    const { customerName, customerEmail, customerState, customerGstin, items, notes, dueInDays } = req.body;
    if (!customerName || !customerEmail || !customerState) return res.status(400).json({ message: 'Customer name, email and state are required.' });
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Add at least one item.' });
    if (items.some((i) => !i.name || !(i.qty > 0) || !(i.price >= 0))) return res.status(400).json({ message: 'Each item needs a name, quantity and price.' });

    const order = await Order.create({ user: req.user._id, customerName, customerEmail, customerState, customerGstin, items, notes, dueInDays });
    const invoice = await createInvoiceForOrder(order, req.user);
    res.status(201).json({ order, invoice });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
