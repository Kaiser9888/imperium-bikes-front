import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://imperium-bikes-api.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
    // Nao adiciona token para rotas de auth (login/register)
    if (!config.url?.includes('/auth/')) {
        const token = localStorage.getItem('@imperium:token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('@imperium:token');
            localStorage.removeItem('@imperium:user');
            if (!window.location.pathname.includes('/login') &&
                !window.location.pathname.includes('/cadastro')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;