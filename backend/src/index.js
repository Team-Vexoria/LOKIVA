import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db/db.js';
import { seedDatabase } from './db/seed.js';
import { authRouter } from './routes/auth.js';
import { destinationsRouter } from './routes/destinations.js';
import { experiencesRouter } from './routes/experiences.js';
import { aiRouter } from './routes/ai.js';
import { itinerariesRouter } from './routes/itineraries.js';
import { providersRouter } from './routes/providers.js';
import { adminRouter } from './routes/admin.js';
import { reviewsRouter } from './routes/reviews.js';
import { router as ingestionRouter } from './routes/ingestion.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(
  cors({
    origin: (origin, callback) => callback(null, true), // Allow all origins in local dev
    credentials: true,
  })
);
app.use(express.json());

// Routes mounted under /api/v1 (identical to FastAPI contract)
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/destinations', destinationsRouter);
app.use('/api/v1/experiences', experiencesRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/recommendations', aiRouter);
app.use('/api/v1/itineraries', itinerariesRouter);
app.use('/api/v1/providers', providersRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/ingestion', ingestionRouter);

// Root and Health Endpoints
app.get('/', (req, res) => {
  res.json({
    app: 'LOKIVA Node.js API',
    tagline: 'Find the place. Feel the local.',
    status: 'healthy',
    version: '1.0.0',
    platform: 'Node.js Express + SQLite',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', coverage: 'pan_india_dynamic' });
});

// Initialize database and start listening
async function startServer() {
  await initDb();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`LOKIVA Backend API listening at http://localhost:${PORT}`);
  });
}

startServer();
