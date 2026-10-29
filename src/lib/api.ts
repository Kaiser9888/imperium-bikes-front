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
        // Nova tentativa após 401: já vem com o token renovado
        if ((config as any)._tokenRenovado) return config;
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
  async (error) => {
      // O token do Clerk vale 1 minuto. Com o backend acordando (Render leva minutos),
      // a requisição chega lá com o token vencido: renova e tenta uma vez de novo.
      const config = error.config;
      const session = typeof window !== 'undefined'
          ? (window as unknown as { Clerk?: { session?: { getToken(o?: { skipCache?: boolean }): Promise<string | null> } } }).Clerk?.session
          : null;
      if (error.response?.status === 401 && config && !config._tokenRenovado && session) {
          try {
              const token = await session.getToken({ skipCache: true });
              if (token) {
                  config._tokenRenovado = true;
                  config.headers.Authorization = `Bearer ${token}`;
                  return api.request(config);
              }
          } catch {
              // sem token novo: segue com o erro original
          }
      }
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
