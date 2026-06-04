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
        // Não adiciona token para rotas de autenticação
        const publicRoutes = ['/auth/login', '/auth/register', '/auth/refresh'];
        const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

        if (!isPublicRoute) {
            const token = authService.getToken();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.warn('⚠️ Token não encontrado para rota:', config.url);
            }
        }

        console.log('📡 Requisição:', {
            url: `${config.baseURL}${config.url}`,
            method: config.method?.toUpperCase(),
            hasToken: !!config.headers.Authorization,
            token: config.headers.Authorization ? 'presente' : 'ausente'
        });

        return config;
    },
    (error) => {
        console.error('❌ Erro no interceptor:', error);
        return Promise.reject(error);
    }
);

// Interceptor de resposta para tratar erros
api.interceptors.response.use(
    (response) => {
        console.log('✅ Resposta:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('❌ Erro na resposta:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });

        // Se o erro for 401 (não autorizado), redireciona para login
        if (error.response?.status === 401) {
            console.warn('🔄 Token expirado ou inválido, redirecionando para login...');
            authService.logout(); // Limpa o token inválido
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;