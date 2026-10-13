import axios from 'axios';
import { API_BASE_URL } from '@/lib/api-config';

const BASE_URL = API_BASE_URL.startsWith('http') ? API_BASE_URL : `https://${API_BASE_URL}`;

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
    return config;
});

api.interceptors.response.use(
  (response) => {
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
