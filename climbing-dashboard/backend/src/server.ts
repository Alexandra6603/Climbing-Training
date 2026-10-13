import 'dotenv/config';
import express from 'express';
import cors from "cors";
import { standardsRouter } from './routes/standards.route.js';
import { prisma } from './db/prisma.js';

const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.use("/standards", standardsRouter);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});