import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import daoRoutes from './sui_api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/dao', daoRoutes);

app.listen(PORT, () => {
  console.log(`✅ API server listening at http://localhost:${PORT}`);
});