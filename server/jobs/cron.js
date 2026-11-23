import cron from 'node-cron';
import Invoice from '../models/Invoice.js';
import User from '../models/User.js';
import { sendInvoiceEmail } from '../services/mailer.js';
import { deliver } from '../services/invoiceService.js';

export default function startJobs() {
  // Every day 9:00 AM: mark overdue + send reminder (max once per 3 days)
  cron.schedule('0 9 * * *', async () => {
    await Invoice.updateMany({ status: 'sent', dueDate: { $lt: new Date() } }, { status: 'overdue' });
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
    const due = await Invoice.find({
      status: 'overdue',
      $or: [{ lastReminderAt: null }, { lastReminderAt: { $lt: threeDaysAgo } }],
    });
    for (const inv of due) {
      try {
        const seller = await User.findById(inv.user);
        await sendInvoiceEmail(inv, seller, { reminder: true });
        inv.lastReminderAt = new Date();
        await inv.save();
      } catch (e) {
        console.error('Reminder failed:', inv.invoiceNo, e.message);
      }
    }
    console.log(`[cron] overdue check done, ${due.length} reminders processed`);
  });

  // Every 30 min: retry invoice emails that failed (max 3 tries)
  cron.schedule('*/30 * * * *', async () => {
    const failed = await Invoice.find({ emailStatus: 'failed', emailRetries: { $lt: 3 } });
    for (const inv of failed) {
      const seller = await User.findById(inv.user);
      await deliver(inv, seller);
    }
    if (failed.length) console.log(`[cron] retried ${failed.length} failed emails`);
  });

  console.log('Cron jobs scheduled');
}
