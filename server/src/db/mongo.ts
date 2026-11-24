import mongoose from 'mongoose';
import { env } from '../config/env';

// One shared connection for the whole API.
// Locally the server process keeps it open. On Netlify, a warm function reuses it
// between requests, because this module is only loaded once per function instance.
let connection: Promise<typeof mongoose> | undefined;
let wasConnected = false;

// Hides the username and password in an Atlas connection string before it's logged.
function safeUri(uri: string): string {
    return uri.replace(/\/\/[^@/]+@/, '//***:***@');
}

export function connectToMongo(): Promise<typeof mongoose> {
    if (!env.mongoUri) {
        console.error('[db] MONGO_URI is not set. Add it to the root .env file (locally) or to Netlify\'s environment variables (live).');
        return Promise.reject(new Error('MONGO_URI is not set'));
    }

    // Already connected, or a connection attempt is in progress: reuse it.
    connection ??= mongoose
        .connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 })
        .then((m) => {
            wasConnected = true;
            console.log(`[db] MongoDB connected (${m.connection.host}/${m.connection.name})`);
            return m;
        })
        .catch((error: Error) => {
            // Forget the failed attempt so the next request tries again.
            connection = undefined;
            console.error(`[db] Could not connect to MongoDB at ${safeUri(env.mongoUri!)}: ${error.message}`);
            console.error('[db] Is the database running? Locally, start it with: docker compose up -d mongo');
            throw error;
        });

    return connection;
}

export async function disconnectFromMongo(): Promise<void> {
    wasConnected = false;
    connection = undefined;
    await mongoose.disconnect();
}

export function isMongoConnected(): boolean {
    return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
}

// Logs the database dropping out after it was connected. Mongoose reconnects on its own.
mongoose.connection.on('disconnected', () => {
    if (wasConnected) console.error('[db] MongoDB disconnected. Retrying in the background...');
});
mongoose.connection.on('reconnected', () => {
    console.log('[db] MongoDB reconnected');
});