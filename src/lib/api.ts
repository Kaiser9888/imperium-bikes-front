import axios from 'axios';

// Garantir que a URL tenha https://
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Se a URL não começar com http, adicionar https://
const BASE_URL = API_URL.startsWith('http')
    ? API_URL
    : `https://${API_URL}`;

console.log('🔧 API Base URL:', BASE_URL); // Para debug

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de request para debug
api.interceptors.request.use((config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('🌐 Requisição para:', fullUrl);
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
            baseURL: error.config?.baseURL,
            fullUrl: `${error.config?.baseURL}${error.config?.url}`,
            status: error.response?.status,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export default api;