import type { RequestHandler } from 'express';

// Runs after every router, so any request that reaches it matched no route.
export const notFound: RequestHandler = (req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
};