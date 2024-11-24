import jwt from 'jsonwebtoken';
import { prisma } from '../lib/db.js';

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = async (req, res, next) => {
  console.log('Auth middleware called');
  console.log('Headers:', req.headers);
  
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);
    
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Extracted token:', token);

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('Verifying token with secret:', JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    console.log('Found user:', user ? user.email : 'null');

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    console.log('Auth successful for user:', user.email);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};
