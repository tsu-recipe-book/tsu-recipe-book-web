import axios from 'axios';

const api = axios.create({
  baseURL: 'http://109.120.157.233:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Basic error handling for Phase 1
    const message = error.response?.data?.message || error.message || 'Unknown error';
    console.error(`API Error: ${message}`);
    return Promise.reject(error);
  }
);

export default api;
