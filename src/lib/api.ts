import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://imperium-bikes.onrender.com';
const BASE_URL = API_URL.startsWith('http') ? API_URL : `https://${API_URL}`;

console.log('🔧 API Base URL:', BASE_URL);

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    try {
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

api.interceptors.response.use(
  (response) => {
      console.log('✅ Resposta:', response.status, response.config.url);
      return response;
  },
  (error) => {
      console.error('❌ Erro na requisição:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
      });
      return Promise.reject(error);
  }
);

export default api;
export { api };