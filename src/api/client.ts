import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function apiFetch<T>(path: string, options: { method?: string; data?: any } = {}) {
  const response = await client.request<T>({ url: path, method: options.method ?? 'GET', data: options.data });
  return response.data;
}
