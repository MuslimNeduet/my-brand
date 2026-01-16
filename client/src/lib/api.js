import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL, timeout: 12000 });

// Avoid 304/no-body on GETs
api.interceptors.request.use((config) => {
  if ((config.method || 'get').toLowerCase() === 'get') {
    config.params = { ...(config.params || {}), _ts: Date.now() };
  }
  return config;
});

const savedToken = localStorage.getItem('token');
if (savedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
}

export default api;