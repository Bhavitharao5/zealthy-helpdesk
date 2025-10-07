import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import ticketsRouter from './routes/tickets.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/tickets', ticketsRouter);

export default app;
