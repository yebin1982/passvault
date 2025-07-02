import axios from 'axios';

const axiosInstance = axios.create({
  // The VITE_API_URL will be set in the .env file
  // e.g., VITE_API_URL=http://localhost:3000/api
  baseURL: import.meta.env.VITE_API_URL,
});

export default axiosInstance;