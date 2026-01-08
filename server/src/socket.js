import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let ioInstance = null;

const resolveAllowedOrigins = () => {
  const origins = [
    process.env.CLIENT_ORIGIN,
    process.env.ADMIN_ORIGIN,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean);

  return origins.length > 0 ? origins : ['http://localhost:3000'];
};

export const initSocket = httpServer => {
  const corsOrigins = resolveAllowedOrigins();

  ioInstance = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance.engine.on('connection_error', err => {
    console.warn('Socket engine connection error:', err.code, err.message);
  });

  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('unauthorized'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.role !== 'admin') {
        return next(new Error('forbidden'));
      }
      socket.data.user = decoded;
      return next();
    } catch (error) {
      return next(new Error('unauthorized'));
    }
  });

  ioInstance.on('connection', socket => {
    socket.join('admins');

    socket.on('disconnect', () => {
      // Keep the handler to make future cleanup/metrics straightforward
    });
  });

  return ioInstance;
};

export const emitOrderCreated = payload => {
  if (!ioInstance) return;
  ioInstance.to('admins').emit('order:new', payload);
};

export const getIO = () => ioInstance;
