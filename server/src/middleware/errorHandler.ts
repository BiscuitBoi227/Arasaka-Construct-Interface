import type { ErrorRequestHandler } from 'express';

// Express 5 sends errors thrown in route handlers (async ones too) here.
// The full error is logged on the server; the client only gets a short JSON message.
type HttpError = Error & { status?: number; statusCode?: number; expose?: boolean };

export const errorHandler: ErrorRequestHandler = (err: HttpError, req, res, next) => {
    if (res.headersSent) {
        next(err);
        return;
    }

    const status = err.status ?? err.statusCode ?? 500;

    // Client mistakes that Express already flags, like malformed JSON in the body (400).
    // `expose` is set by Express's own HTTP errors when the message is safe to show.
    if (status >= 400 && status < 500 && err.expose) {
        res.status(status).json({ error: err.message });
        return;
    }


    console.error(`[api] ${req.method} ${req.originalUrl} failed:`, err);
    res.status(500).json({ error: 'Internal server error' });
};