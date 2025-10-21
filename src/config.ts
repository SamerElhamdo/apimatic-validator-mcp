import { config as loadEnv } from 'dotenv';

loadEnv();

export interface AppConfig {
  apiBaseUrl: string;
  authBearerToken: string;
  timeout: number;
  port: number;
}

let cachedConfig: AppConfig | null = null;

function readEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getConfig(): AppConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const apiBaseUrl = readEnv('API_BASE_URL');
  const authBearerToken = readEnv('AUTH_BEARER_TOKEN');
  const timeout = Number(process.env.API_TIMEOUT ?? '30000');
  const port = Number(process.env.PORT ?? '3000');

  cachedConfig = {
    apiBaseUrl,
    authBearerToken,
    timeout: Number.isNaN(timeout) ? 30000 : timeout,
    port: Number.isNaN(port) ? 3000 : port,
  };

  return cachedConfig;
}

export function resetConfig(): void {
  cachedConfig = null;
}

