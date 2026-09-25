import { apiFetch } from "@/lib/apiClient"
import type { CreatePaymentRequest, PaymentResponse } from "@/types/payment"

type GetToken = () => Promise<string | null>

export const paymentService = {
  async create(payload: CreatePaymentRequest, getToken: GetToken): Promise<PaymentResponse> {
    return apiFetch<PaymentResponse>("/api/payments", getToken, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async findById(paymentId: string, getToken: GetToken): Promise<PaymentResponse> {
    return apiFetch<PaymentResponse>(`/api/payments/${paymentId}`, getToken)
  },
}
