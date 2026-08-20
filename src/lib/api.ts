import axios from 'axios';
import { extractSubdomain } from './subdomain';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => { accessToken = token; };

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const subdomain = extractSubdomain();
    if (subdomain) {
      config.headers['x-tenant-slug'] = subdomain;
    }
  }
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const requestUrl = String(err.config?.url || '');
    const isAuthRequest = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/check-slug', '/auth/workspace']
      .some((path) => requestUrl.includes(path));
    const sentToken = Boolean(err.config?.headers?.Authorization);
    if (err.response?.status === 401 && sentToken && !isAuthRequest && !err.config?._retried) {
      err.config._retried = true;
      try {
        const refreshed = await api.post('/auth/refresh');
        setAccessToken(refreshed.data.data.accessToken);
        err.config.headers.Authorization = `Bearer ${refreshed.data.data.accessToken}`;
        return api.request(err.config);
      } catch {
        setAccessToken(null);
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') window.location.assign('/login');
      }
    }
    return Promise.reject(err);
  }
);

export default api;
