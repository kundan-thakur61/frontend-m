import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://my-backend-pcyj.onrender.com/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(
        new CustomEvent('app:unauthorized', { detail: { status: 401 } })
      );
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
