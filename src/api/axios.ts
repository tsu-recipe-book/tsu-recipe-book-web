import axios from 'axios';

export const BASE_URL = 'http://109.120.157.233:8081';
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null,
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Unknown error';
    console.error(`API Error: ${message}`);
    return Promise.reject(error);
  }
);

export default api;
