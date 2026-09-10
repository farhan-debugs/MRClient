import jwt from 'jsonwebtoken';
import prisma from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'unified-task-tracker-secret-key-2026';

export async function authenticate(req, res, next) {
  try {
    // 1. Check for custom demo impersonation header (for quick user switcher)
    const demoUserId = req.headers['x-user-id'];
    if (demoUserId) {
      const user = await prisma.user.findUnique({
        where: { id: demoUserId },
        select: { id: true, name: true, email: true, role: true, avatar: true }
      });
      if (user) {
        req.user = user;
        return next();
      }
    }

    // 2. Check for Authorization Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true, role: true, avatar: true }
      });
      if (user) {
        req.user = user;
        return next();
      }
    }

    // 3. Fallback to default first user (Sarah / Admin) if no auth provided
    const defaultUser = await prisma.user.findFirst({
      select: { id: true, name: true, email: true, role: true, avatar: true }
    });
    if (defaultUser) {
      req.user = defaultUser;
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized. No active user found.' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}
