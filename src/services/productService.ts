// src/services/productService.ts
import api from '../lib/api';

export const productService = {
    async getAll(page = 0, size = 10, sort = 'createdAt,desc') {
        try {
            const response = await api.get('/api/products', {
                params: { page, size, sort }
            });
            console.log('✅ Produtos recebidos:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao buscar produtos:', error);
            throw error;
        }
    },

    async getById(id: string) {
        try {
            const response = await api.get(`/api/products/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Erro ao buscar produto ${id}:`, error);
            throw error;
        }
    },

    async getDestaques() {
        try {
            // Tentar endpoint de destaques, se existir
            const response = await api.get('/api/products/destaques');
            return response.data;
        } catch (error) {
            // Fallback: buscar todos e filtrar
            console.log('⚠️ Endpoint /destaques não encontrado, usando /api/products');
            const allProducts = await this.getAll(0, 10, 'createdAt,desc');
            return allProducts;
        }
    }
};