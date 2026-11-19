import { Router } from 'express';

// GET /api/health: a quick check that the API is up.
export const healthRoutes = Router();

healthRoutes.get('/', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});