import axios from 'axios';

// The base URL for all API requests
// In production, this will be your hosted Render/Heroku URL
// In development, it will fallback to the Render URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 
    (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://skillswap-ejm8.onrender.com');

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Automatically add the token to the headers of every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

export default api;
export { API_BASE_URL };
