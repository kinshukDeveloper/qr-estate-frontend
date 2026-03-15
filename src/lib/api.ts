import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// ── AXIOS INSTANCE ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── REQUEST INTERCEPTOR — attach access token ─────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR — handle token refresh ───────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until refresh is done
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();

      if (!refreshToken) {
        clearAuth();
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } = response.data.data;

        setTokens(newAccess, newRefresh);
        processQueue(null, newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        window.location.href = '/auth/login?expired=true';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── AUTH API CALLS ────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    rera_number?: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  getMe: () => api.get('/auth/me'),

  updateProfile: (data: Partial<{
    name: string;
    phone: string;
    rera_number: string;
  }>) => api.patch('/auth/profile', data),
};

export default api;
