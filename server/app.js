import cors from 'cors';
import express from 'express';
import { createCaseRouter } from './routes/caseRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { isDatabaseConnected } from './config/database.js';

export function createApp(caseRouteOptions = {}) {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_URL || 'http://127.0.0.1:5173' }));
  app.use(express.json({ limit: '16kb' }));

  app.get('/api/health', (_request, response) => {
    response.status(isDatabaseConnected() ? 200 : 503).json({
      status: isDatabaseConnected() ? 'ok' : 'degraded',
      service: 'ai-mystery-room-api',
      database: isDatabaseConnected() ? 'connected' : 'disconnected',
    });
  });

  app.use('/api/cases', createCaseRouter(caseRouteOptions));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
