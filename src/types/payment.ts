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
  /** Com frete: para onde o vendedor envia (vai na etiqueta). */
  endereco?: EnderecoEntrega
}

export interface EnderecoEntrega {
  nome: string
  /** DDD + número, só dígitos. */
  telefone: string
  /** 11 dígitos. */
  cpf: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  uf: string
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