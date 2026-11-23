import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = Router();
const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, businessName: u.businessName, gstin: u.gstin, address: u.address, state: u.state, phone: u.phone });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, businessName, state } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    if (await User.findOne({ email })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name, email, password, businessName, state });
    res.status(201).json({ token: sign(user._id), user: pub(user) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password || ''))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  res.json({ token: sign(user._id), user: pub(user) });
});

router.get('/me', auth, (req, res) => res.json({ user: pub(req.user) }));

router.put('/profile', auth, async (req, res) => {
  const fields = ['name', 'businessName', 'gstin', 'address', 'state', 'phone'];
  fields.forEach((f) => req.body[f] !== undefined && (req.user[f] = req.body[f]));
  await req.user.save();
  res.json({ user: pub(req.user) });
});

export default router;
