/** Um produto, ou vários pagos de uma vez pelo carrinho. */
export type PaymentType = "PRODUCT_PURCHASE" | "CART_PURCHASE"

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELED"
  | "REFUNDED"

export interface CreatePaymentRequest {
  type: PaymentType
  referenceId: string
  /** Carrinho: id da compra, gerado no navegador (repetir o clique reaproveita o pagamento). */
  referenceType: "PRODUCT" | "CART"
  description?: string
  /** Carrinho: cada item e a opção de frete dele (sem ela, retirada em mãos). */
  itens?: { productId: string; freteServiceId?: string }[]
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
  /** Tipo vindo do backend (compra, inscrição, destaque, anúncio) e o que foi pago. */
  type?: string
  referenceId?: string
  stripeSessionId?: string
  createdAt: string
}