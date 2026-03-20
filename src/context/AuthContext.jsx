import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
const API_BASE = 'http://localhost:8080';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refresh_token'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const navigate = useNavigate();

  const setSession = useCallback(({accessToken, refreshToken, numDocumento, nombre, rol}) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify({ numDocumento, nombre, rol }));
    setToken(accessToken);
    setRefreshToken(refreshToken);
    setUser({ numDocumento, nombre, rol });
  }, []);

  const login = useCallback(async (numDocumento, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { num_documento: numDocumento, password });
    setSession(res.data);
    return res.data;
  }, [setSession]);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API_BASE}/auth/logout`, null, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
      console.warn('Logout fallback', e);
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate, token]);

  const authAxios = axios.create({ baseURL: API_BASE });
  authAxios.interceptors.request.use(config => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const refreshSession = useCallback(async () => {
    if (!refreshToken) throw new Error('No refresh token');
    const res = await axios.post(`${API_BASE}/auth/refresh`, null, { headers: { Authorization: `Bearer ${refreshToken}` } });
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    setSession({ ...currentUser, accessToken: res.data.access_token, refreshToken: refreshToken });
    return res.data.access_token;
  }, [refreshToken, setSession]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, authAxios, refreshSession, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
