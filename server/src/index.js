import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { ENV } from './config/env.js';
import { testDbConnection } from './config/db.js';
import authRouter from './routes/auth.js';
import medicinesRouter from './routes/medicines.js';
import pharmaciesRouter from './routes/pharmacies.js';
import inventoryRouter from './routes/inventory.js';
import aiRouter from './routes/ai.js';
import adminRouter from './routes/admin.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (ENV.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
const healthHandler = (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MediFind API',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
    features: {
      gemini_ai: Boolean(ENV.GEMINI_API_KEY),
      google_maps: Boolean(ENV.GOOGLE_MAPS_API_KEY),
      supabase: Boolean(ENV.SUPABASE_URL),
    },
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get('/api', (req, res) => res.json({ status: 'ok', service: 'MediFind API' }));

// Mount Routes (supporting both /api/* and root/* for flexible Vercel rewrites)
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

app.use('/api/medicines', medicinesRouter);
app.use('/medicines', medicinesRouter);

app.use('/api/pharmacies', pharmaciesRouter);
app.use('/pharmacies', pharmaciesRouter);

app.use('/api/inventory', inventoryRouter);
app.use('/inventory', inventoryRouter);

app.use('/api/ai', aiRouter);
app.use('/ai', aiRouter);

app.use('/api/admin', adminRouter);
app.use('/admin', adminRouter);

// Serve static frontend assets if built and running locally (not on Vercel)
if (!process.env.VERCEL && fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server when run directly, not in Vercel serverless environment
if (!process.env.VERCEL) {
  const server = app.listen(ENV.PORT, async () => {
    console.log(`🚀 MediFind Server listening on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
    console.log(`📡 API Endpoints base: http://localhost:${ENV.PORT}/api`);
    await testDbConnection();
  });
}

export default app;
