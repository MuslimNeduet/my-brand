import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Not authorized, token missing' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Not authorized' });
  }
}

export async function adminOnly(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('isAdmin');
    if (!user?.isAdmin) return res.status(403).json({ message: 'Admins only' });
    next();
  } catch {
    return res.status(403).json({ message: 'Admins only' });
  }
}