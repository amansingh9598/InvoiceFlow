import { Router } from 'express';
import Invoice from '../models/Invoice.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res) => {
  const user = req.user._id;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5, 1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [totals, monthly, byStatus, recent] = await Promise.all([
    Invoice.aggregate([
      { $match: { user } },
      { $group: { _id: null, count: { $sum: 1 }, billed: { $sum: '$total' }, gst: { $sum: '$totalTax' },
          paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$total', 0] } },
          pending: { $sum: { $cond: [{ $ne: ['$status', 'paid'] }, '$total', 0] } } } },
    ]),
    Invoice.aggregate([
      { $match: { user, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, gst: { $sum: '$totalTax' }, count: { $sum: 1 } } },
    ]),
    Invoice.aggregate([{ $match: { user } }, { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$total' } } }]),
    Invoice.find({ user }).sort('-createdAt').limit(5),
  ]);

  // fill empty months so the chart always shows 6 points
  const series = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const hit = monthly.find((x) => x._id.y === d.getFullYear() && x._id.m === d.getMonth() + 1);
    series.push({ month: d.toLocaleString('en-IN', { month: 'short' }), revenue: hit?.revenue || 0, gst: hit?.gst || 0, count: hit?.count || 0 });
  }

  const overdue = byStatus.find((s) => s._id === 'overdue');
  res.json({
    totals: { count: 0, billed: 0, gst: 0, paid: 0, pending: 0, ...(totals[0] || {}) },
    overdue: { count: overdue?.count || 0, amount: overdue?.amount || 0 },
    monthly: series,
    byStatus: byStatus.map((s) => ({ name: s._id, value: s.count })),
    recent,
  });
});

export default router;
