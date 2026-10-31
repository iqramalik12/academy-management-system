import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import apiRouter from './src/backend/routes/apiRoutes.ts';
import { connectDB } from './src/backend/config/db.ts';
import { store } from './src/backend/services/store.ts';
import { errorHandler } from './src/backend/middleware/errorHandler.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Connect database if MONGO_URI is set
  await connectDB();
  await store.initMongoSync();

  // API Routes
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Academy Management System API',
      timestamp: new Date().toISOString(),
    });
  });

  // Frontend integration (Vite dev middlewares in dev mode, dist static in prod)
  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('⚡ [Vite] Dev middleware mounted.');
    } catch (err) {
      console.error('Failed to start Vite middleware:', err);
    }
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  // Global Error Handler
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`🎓 Academy Management System Server`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`📡 API Endpoints at: http://localhost:${PORT}/api`);
    console.log(`==================================================\n`);
  });
}

startServer().catch(err => {
  console.error('Fatal server boot failure:', err);
  process.exit(1);
});
