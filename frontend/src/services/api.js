import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export function getErrorMessage(error) {
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Cannot reach the server. Please check that the backend is running.';
  }
  return error.response?.data?.message || 'Something went wrong. Please try again.';
}

export default api;
