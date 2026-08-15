import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('inventrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global 401 unauthorized & 403 account deactivated auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const isDeactivated = error.response.status === 403 && (
        error.response.data?.error === 'ACCOUNT_DEACTIVATED' ||
        String(error.response.data?.message || '').toLowerCase().includes('deactivated')
      );

      if (error.response.status === 401 || isDeactivated) {
        localStorage.removeItem('inventrack_token');
        localStorage.removeItem('inventrack_user');
        if (window.location.pathname !== '/login') {
          window.location.href = isDeactivated ? '/login?deactivated=1' : '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
