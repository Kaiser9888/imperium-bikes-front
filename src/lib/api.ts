// lib/api.ts
import axios from 'axios';
import { authService } from '@/services/authService';

const api = axios.create({
    baseURL: 'https://imperium-bikes-api.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(
    (config) => {
        // ✅ CORRIGIDO: Rotas públicas com /api/
        const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
        const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

        if (!isPublicRoute) {
            const token = authService.getToken();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('🔐 Token adicionado para:', config.url);
            } else {
                console.warn('⚠️ Token não encontrado para rota:', config.url);
            }
        } else {
            console.log('🌐 Rota pública (sem token):', config.url);
        }

        return config;
    },
    (error) => {
        console.error('❌ Erro no interceptor:', error);
        return Promise.reject(error);
    }
);

// Interceptor de resposta
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('❌ Erro na resposta:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
        });

        // Se for 401, redireciona para login
        if (error.response?.status === 401) {
            console.warn('🔄 Token expirado, redirecionando...');
            authService.logout();
        }

        return Promise.reject(error);
    }
);

export default api;