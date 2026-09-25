import { apiFetch } from "@/lib/apiClient"
import type { CarteiraResponse, TransacaoResponse, PageResponse } from "@/types/carteira"

type GetToken = () => Promise<string | null>

export const carteiraService = {
  async getCarteira(getToken: GetToken): Promise<CarteiraResponse> {
    return apiFetch<CarteiraResponse>("/api/carteira", getToken)
  },

  async getExtrato(page: number, getToken: GetToken): Promise<PageResponse<TransacaoResponse>> {
    return apiFetch<PageResponse<TransacaoResponse>>(`/api/carteira/extrato?page=${page}&size=10`, getToken)
  },
}