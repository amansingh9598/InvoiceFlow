import mongoose from 'mongoose';

const lineSchema = new mongoose.Schema(
  { name: String, hsn: String, qty: Number, price: Number, gstRate: Number, taxable: Number, tax: Number },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    invoiceNo: { type: String, required: true },
    customerName: String,
    customerEmail: String,
    customerGstin: String,
    customerState: String,
    lines: [lineSchema],
    subtotal: Number,
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalTax: Number,
    total: Number,
    isInterState: Boolean,
    notes: String,
    status: { type: String, enum: ['sent', 'paid', 'overdue'], default: 'sent' },
    issueDate: { type: Date, default: Date.now },
    dueDate: Date,
    paidAt: Date,
    emailStatus: { type: String, enum: ['pending', 'sent', 'failed', 'skipped'], default: 'pending' },
    emailRetries: { type: Number, default: 0 },
    lastReminderAt: Date,
  },
  { timestamps: true }
);

invoiceSchema.index({ user: 1, invoiceNo: 1 }, { unique: true });

export default mongoose.model('Invoice', invoiceSchema);
