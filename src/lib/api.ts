import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'imperium-bikes-production.up.railway.app' ;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor simplificado - sem Clerk por enquanto
api.interceptors.request.use((config) => {
    // Para debug
    console.log('🌐 Requisição para:', `${config.baseURL}${config.url}`);

    // Por enquanto, vamos fazer requisições sem token
    // Até configurar corretamente o Clerk no backend
    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log('✅ Resposta:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ Erro:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message
        });

        if (error.response?.status === 401) {
            window.location.href = '/sign-in';
        }
        return Promise.reject(error);
    }
);

export default api;