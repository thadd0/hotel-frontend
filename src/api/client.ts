import axios from 'axios';
import {
  getAccessToken,
  setAccessToken,
  clearAuthStorage,
} from '../auth/storage';

export const API_BASE = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // send the HttpOnly refresh_token cookie on every request
});

// Inject access token on every request
client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh access token on 401 — refresh_token cookie is sent automatically
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    if (status !== 401) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the failing request is login or refresh itself
    const url = originalRequest.url || '';
    if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/logout')) {
      return Promise.reject(error);
    }

    try {
      originalRequest._retry = true;
      const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!refreshResponse.ok) {
        throw new Error('Refresh failed');
      }
      const refreshData = await refreshResponse.json();

      const newAccessToken = refreshData?.access_token;
      if (!newAccessToken) {
        throw new Error('Refresh response missing access token');
      }

      setAccessToken(newAccessToken);
      window.dispatchEvent(new CustomEvent('auth:tokenRefreshed', { detail: newAccessToken }));
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return client.request(originalRequest);
    } catch (refreshError) {
      clearAuthStorage();
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(refreshError);
    }
  }
);

export async function apiFetch<T>(path: string, options: { method?: string; data?: any; params?: any } = {}) {
  const response = await client.request<T>({
    url: path,
    method: options.method ?? 'GET',
    data: options.data,
    params: options.params,
  });
  return response.data;
}
