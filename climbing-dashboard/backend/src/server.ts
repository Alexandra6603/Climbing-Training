import 'dotenv/config';
import express from 'express';
import cors from "cors";
import { standardsRouter } from './routes/standards.route.js';
import { authRouter } from './routes/auth.route.js';
import { timersRouter } from './routes/timers.route.js';

const app = express();
const allowedOrigins = new Set([
  'http://localhost:5173',
  ...(process.env.FRONTEND_URL ?? '').split(',').map((origin) => origin.trim()).filter(Boolean),
]);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());


app.get('/', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRouter);
app.use("/standards", standardsRouter);
app.use('/timers', timersRouter);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
