import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hsn: { type: String, default: '' },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, default: 18, enum: [0, 5, 12, 18, 28] },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerGstin: { type: String, default: '', uppercase: true },
    customerState: { type: String, required: true },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    notes: { type: String, default: '' },
    dueInDays: { type: Number, default: 15 },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
