import 'dotenv/config';
import express from 'express';
import cors from "cors";
import { standardsRouter } from './routes/standards.route.js';
import { prisma } from './db/prisma.js';

// Initialize Prisma
const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.use("/standards", standardsRouter);

// app.get('/standards', async (req, res) => {
//   const standards = await prisma.standard.findMany();

//   res.json(standards);
// });

app.get('/standards-attempts', async (req, res) => {
  const attempts = await prisma.standardsAttempt.findMany({
    include: {
      values: true,
    },
  });

  const result = attempts.map((attempt) => ({
    id: attempt.id,
    date: attempt.date,
    status: attempt.status,
    values: Object.fromEntries(
      attempt.values.map((item) => [
        item.standardId,
        item.value,
      ])
    ),
  }));

  res.json(result);
});

// app.post('/standards', async (req, res) => {
//   const { name } = req.body;

//   const standard = await prisma.standard.create({
//     data: { name },
//   });

//   res.json(standard);
// });

// app.put('/standards/:id', async (req, res) => {
//   const { id } = req.params;
//   const { name } = req.body;
//   const standard = await prisma.standard.update({
//     where: { id: parseInt(id) },
//     data: { name },
//   });
//   res.json(standard);
// });

// app.delete('/standards/:id', async (req, res) => {
//   const { id } = req.params;
//   const standard = await prisma.standard.delete({
//     where: { id: parseInt(id) },
//   });
//   res.json(standard);
// });


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});