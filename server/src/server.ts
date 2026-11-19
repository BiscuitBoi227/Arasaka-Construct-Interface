import { app } from './app';
import { env } from './config/env';

// Local entry point only (npm run dev -w server).
// Netlify never runs this file.
app.listen(env.port, (error) => {
    if (error) {
        console.error(`[api] Could not start on port ${env.port}:`, error.message);
        process.exit(1);
    }
    console.log(`[api] Listening on http://localhost:${env.port} (try /api/health)`);
});