import api from '@/lib/api'
import {
    ProductRequest,
    ProductResponse,
    ShippingQuote,
} from '@/types/publish/product'

const BASE = '/api/products'

export const productService = {
    create: async (
      data: ProductRequest,
    ): Promise<ProductResponse> => {
        const res = await api.post(
          BASE,
          data,
        )

        return res.data
    },

    getAll: async (
      page = 0,
      size = 20,
    ): Promise<{
        content: ProductResponse[]
        totalElements: number
        totalPages: number
        number: number
        size: number
    }> => {
        const res = await api.get(
          BASE,
          {
              params: {
                  page,
                  size,
              },
          },
        )

        return res.data
    },

    update: async (
      id: string,
      data: Partial<ProductRequest>,
    ): Promise<ProductResponse> => {
        const res = await api.put(
          BASE + '/' + id,
          data,
        )

        return res.data
    },

    getById: async (
      id: string,
    ): Promise<ProductResponse> => {
        const res = await api.get(
          BASE + '/' + id,
        )

        return res.data
    },

    getMyProducts: async (
      page = 0,
      size = 10,
    ): Promise<{
        content: ProductResponse[]
        totalElements: number
    }> => {
        const res = await api.get(
          BASE + '/my',
          {
              params: {
                  page,
                  size,
              },
          },
        )

        return res.data
    },

    calculateShipping: async (
      productId: string,
      cepDestino: string,
    ): Promise<ShippingQuote[]> => {
        const res = await api.post(
          '/api/frete/cotar',
          {
              productId,
              cepDestino:
                cepDestino.replace(/\D/g, ''),
          },
        )

        return res.data
    },

    delete: async (
      id: string,
    ): Promise<void> => {
        await api.delete(
          BASE + '/' + id,
        )
    },

    publish: async (
      id: string,
    ): Promise<ProductResponse> => {
        const res = await api.put(
          BASE + '/' + id + '/publish',
        )

        return res.data
    },
}