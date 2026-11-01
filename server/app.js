import cors from 'cors';
import express from 'express';
import { createCaseRouter } from './routes/caseRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { isDatabaseConnected } from './config/database.js';

const defaultClientOrigins = [
  'http://127.0.0.1:5173',
  'https://ai-mystery-room-green.vercel.app',
];

function getAllowedClientOrigins() {
  const configuredOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([...defaultClientOrigins, ...configuredOrigins]);
}

export function createApp(caseRouteOptions = {}) {
  const app = express();
  const allowedClientOrigins = getAllowedClientOrigins();

  app.use(cors({
    origin(origin, callback) {
      if (!origin) return callback(null, false);
      return callback(null, allowedClientOrigins.has(origin) ? origin : false);
    },
  }));
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
