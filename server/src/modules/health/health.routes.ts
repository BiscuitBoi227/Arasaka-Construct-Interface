import { Router } from 'express';
import { connectToMongo, isMongoConnected } from '../../db/mongo';

// GET /api/health: a quick check that the API is up, and whether it can reach MongoDB.
export const healthRoutes = Router();

healthRoutes.get('/', async (_req, res) => {
    // Connects on the first request (and retries after a failure). Errors are logged in db/mongo.ts.
    await connectToMongo().catch(() => {
    });

    res.json({
        status: 'ok',
        database: isMongoConnected() ? 'connected' : 'disconnected',
        time: new Date().toISOString(),
    });
});