// Demo data so the dashboard charts are not empty:  npm run seed
// Login: demo@invoiceflow.in / demo123
import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Order from "./models/Order.js";
import Invoice from "./models/Invoice.js";
import { calcInvoice } from "./services/gst.js";

await mongoose.connect(process.env.MONGO_URI);
await User.deleteOne({ email: "demo@invoiceflow.in" });
const user = await User.create({
  name: "Demo Owner",
  email: "demo@invoiceflow.in",
  password: "demo123",
  businessName: "Sharma Electronics",
  gstin: "09ABCDE1234F1Z5",
  address: "Sector 62, Noida",
  state: "Uttar Pradesh",
  phone: "+91 98765 43210",
});
const customers = [
  ["Rohit Verma", "Uttar Pradesh"],
  ["Anita Singh", "Delhi"],
  ["Kiran Patel", "Gujarat"],
  ["Meera Nair", "Kerala"],
  ["Arjun Mehta", "Maharashtra"],
];
const products = [
  ['LED Monitor 24"', 8500, 18],
  ["Wireless Keyboard", 1800, 18],
  ["Power Bank", 1500, 18],
  ["Printer Ink Pack", 650, 12],
];
let seq = 0;
for (let i = 0; i < 30; i++) {
  const [name, state] = customers[i % customers.length];
  const [pn, price, gstRate] = products[i % products.length];
  const created = new Date();
  created.setDate(created.getDate() - Math.floor(Math.random() * 170));
  const items = [{ name: pn, qty: 1 + (i % 3), price, gstRate }];
  const gst = calcInvoice(items, user.state, state);
  const order = await Order.create({
    user: user._id,
    customerName: name,
    customerEmail: `${name.split(" ")[0].toLowerCase()}@example.com`,
    customerState: state,
    items,
    createdAt: created,
  });
  const due = new Date(created.getTime() + 15 * 86400000);
  const status =
    Math.random() > 0.35 ? "paid" : due < new Date() ? "overdue" : "sent";
  const inv = await Invoice.create({
    user: user._id,
    order: order._id,
    invoiceNo: `INV-${created.getFullYear()}-${String(++seq).padStart(4, "0")}`,
    customerName: name,
    customerEmail: order.customerEmail,
    customerState: state,
    dueDate: due,
    issueDate: created,
    status,
    emailStatus: "sent",
    createdAt: created,
    ...gst,
  });
  order.invoice = inv._id;
  await order.save();
}
await User.updateOne({ _id: user._id }, { invoiceSeq: seq });
console.log("Seeded 30 invoices. Login: demo@invoiceflow.in / demo123");
process.exit(0);
