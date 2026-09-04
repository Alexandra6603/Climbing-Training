import 'dotenv/config';
import express from 'express';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from './generated/prisma/client.js';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const app = express();
app.use(express.json());

const standards = [
  { id: 1, name: 'Pull-up' },
  { id: 2, name: 'Push-up' },
  { id: 3, name: 'Sit-up' },
];

app.get('/', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.get('/standards', async (req, res) => {
  const standards = await prisma.standard.findMany();

  res.json(standards);
});

app.post('/standards', async (req, res) => {
  const { name } = req.body;

  const standard = await prisma.standard.create({
    data: { name },
  });

  res.json(standard);
});

app.put('/standards/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const standard = await prisma.standard.update({
    where: { id: parseInt(id) },
    data: { name },
  });
  res.json(standard);
});

app.delete('/standards/:id', async (req, res) => {
  const { id } = req.params;
  const standard = await prisma.standard.delete({
    where: { id: parseInt(id) },
  });
  res.json(standard);
});


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});