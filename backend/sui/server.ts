import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import daoRoutes from './sui_api';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: '*',
  },
});

app.set('io', io);

app.use(cors());
app.use(express.json());
app.use('/dao', daoRoutes);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ API + WS listening at http://localhost:${PORT}`);
});
