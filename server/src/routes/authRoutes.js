import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Register (no auto-login; per your UX, user goes to login after)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    await User.create({ name, email, password });
    res.status(201).json({ ok: true, message: 'Registered successfully' });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(user);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, isAdmin: !!user.isAdmin }
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Optional: verify token
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('_id name email isAdmin');
  res.json({ user });
});

export default router;