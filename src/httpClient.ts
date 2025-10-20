import axios, { AxiosInstance } from 'axios';
import { AppConfig, getConfig } from './config.js';

export interface ApiClient {
  get<T>(path: string, params?: Record<string, unknown>): Promise<T>;
  post<T>(path: string, data?: unknown): Promise<T>;
  patch<T>(path: string, data?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

let cachedClient: ApiClient | null = null;

function createAxiosInstance(config: AppConfig): AxiosInstance {
  return axios.create({
    baseURL: config.apiBaseUrl,
    timeout: config.timeout,
    headers: {
      Authorization: `Bearer ${config.authBearerToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
}

export function getApiClient(): ApiClient {
  if (cachedClient) {
    return cachedClient;
  }

  const config = getConfig();
  const instance = createAxiosInstance(config);

  cachedClient = {
    async get<T>(path, params) {
      const response = await instance.get<T>(path, { params });
      return response.data;
    },
    async post<T>(path, data) {
      const response = await instance.post<T>(path, data);
      return response.data;
    },
    async patch<T>(path, data) {
      const response = await instance.patch<T>(path, data);
      return response.data;
    },
    async delete<T>(path) {
      const response = await instance.delete<T>(path);
      return response.data;
    },
  };

  return cachedClient;
}

export function resetClient(): void {
  cachedClient = null;
}

