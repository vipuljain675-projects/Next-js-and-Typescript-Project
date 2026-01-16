import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3500/api', // Adjust to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🟢 CRITICAL: Token interceptor for ALL requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🟢 Auto-logout on 401
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
