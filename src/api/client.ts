import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAuthStorage,
} from '../auth/storage';

export const API_BASE = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject JWT token on every request if available
client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh access token on 401 once, then retry original request
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

    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      return Promise.reject(error);
    }

    try {
      originalRequest._retry = true;
      const refreshResponse = await axios.post(`${API_BASE}/auth/refresh`, null, {
        headers: {
          Authorization: `Bearer ${refreshTokenValue}`,
          'Content-Type': 'application/json',
        },
      });

      const newAccessToken = refreshResponse?.data?.access_token;
      const newRefreshToken = refreshResponse?.data?.refresh_token;
      if (!newAccessToken) {
        throw new Error('Refresh response missing access token');
      }

      setAccessToken(newAccessToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return client.request(originalRequest);
    } catch (refreshError) {
      clearAuthStorage();
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
