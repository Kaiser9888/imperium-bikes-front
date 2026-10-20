export type PaymentType = "PRODUCT_PURCHASE"

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELED"
  | "REFUNDED"

export interface CreatePaymentRequest {
  type: PaymentType
  referenceId: string
  referenceType: "PRODUCT"
  description?: string
  /** CEP do comprador; sem ele a entrega é combinada com o vendedor. */
  cepDestino?: string
  /** Opção de frete escolhida na cotação. */
  freteServiceId?: string
}

export interface PaymentResponse {
  id: string
  status: PaymentStatus
  amount: number
  platformFee: number
  checkoutUrl?: string
  stripeSessionId?: string
  createdAt: string
}