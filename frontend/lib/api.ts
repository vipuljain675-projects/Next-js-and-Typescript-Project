import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 🟢 CRITICAL: Token interceptor for ALL requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Debug log to verify API URL (remove after deployment works)
  if (config.baseURL && config.url) {
    console.log('API Request to:', config.baseURL + config.url);
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