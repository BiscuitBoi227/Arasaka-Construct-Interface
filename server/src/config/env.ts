function readPort(value: string | undefined, fallback: number): number {
    if (value === undefined || value.trim() === '') return fallback;

    const port = Number(value);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`PORT must be a whole number from 1 to 65535, but it is "${value}". Check the root .env file.`);
    }
    return port;
}

export const env = {
    port: readPort(process.env.PORT, 3001),
    nodeEnv: process.env.NODE_ENV ?? 'development',
} as const;

export const isProduction = env.nodeEnv === 'production';