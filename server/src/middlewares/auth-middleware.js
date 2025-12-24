import jwt from 'jsonwebtoken';

const verifyToken = req => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token');
  }
  return jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
};

export const userAuth = (req, res, next) => {
  try {
    req.user = verifyToken(req);
    console.log('res user:', req.user);
    next();
  } catch {
    res.status(401).json({ message: 'Authentication required' });
  }
};

export const adminAuth = (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
