import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './config/db.js';
import app from './app.js';
import { initSocket } from './socket.js';

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5001;
const server = createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});