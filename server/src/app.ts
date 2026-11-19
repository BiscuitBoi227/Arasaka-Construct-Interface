import express from 'express';
import { healthRoutes } from './modules/health/health.routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

// Builds the Express app and exports it without calling listen.
// server.ts runs it locally, and netlify/functions/api.ts runs it on Netlify.
export const app = express();

app.disable('x-powered-by');
app.use(express.json());

// Every router is mounted under /api, to match the /api/* redirect in netlify.toml.
app.use('/api/health', healthRoutes);

// These two stay last: anything no router matched gets a 404, and thrown errors get a 500.
app.use(notFound);
app.use(errorHandler);