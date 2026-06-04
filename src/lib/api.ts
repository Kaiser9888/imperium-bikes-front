import axios from 'axios';
import { authService } from '@/services/authService';

const api = axios.create({
    baseURL: 'https://imperium-bikes-api.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const publicRoutes = ['/api/auth/login', '/api/auth/register'];
        const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

        if (!isPublicRoute) {
            const token = authService.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            authService.logout();
        }
        return Promise.reject(error);
    }
);

export default api;