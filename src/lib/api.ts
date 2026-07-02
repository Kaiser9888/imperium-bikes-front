import axios from 'axios';

// Garantir que a URL tenha https://
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://imperium-bikes.onrender.com';

// Se a URL não começar com http, adicionar https://
const BASE_URL = API_URL.startsWith('http')
    ? API_URL
    : `https://${API_URL}`;

console.log('🔧 API Base URL:', BASE_URL);

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token do Clerk automaticamente
api.interceptors.request.use(async (config) => {
    try {
        // Verifica se o Clerk está disponível no window
        if (typeof window !== 'undefined' && (window as any).Clerk?.session) {
            const token = await (window as any).Clerk.session.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch (e) {
        console.warn('Clerk token não disponível');
    }
    console.log('🌐 Requisição para:', `${config.baseURL}${config.url}`);
    return config;
});

// Interceptor de response para debug
api.interceptors.response.use(
    (response) => {
        console.log('✅ Resposta:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ Erro na requisição:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export default api;