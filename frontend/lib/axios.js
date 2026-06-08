import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if it exists in localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('companion_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Delete Content-Type for FormData to let axios and browser auto-set boundaries
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear token and user from localStorage
        localStorage.removeItem('companion_token');
        localStorage.removeItem('companion_user');
        
        // Clear cookie for middleware route protection
        document.cookie = 'companion_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // Redirect to /login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
