// Taxa de segurança (custo do pagamento protegido) e preço mínimo dos anúncios.
// Mantenha igual a TaxaPagamento.java no backend e aos Termos (seção 5).

/** Tarifa do cartão no Stripe (3,99% + R$ 0,39), descontada do vendedor em cada venda. */
export const TAXA_PAGAMENTO_PERCENTUAL = 3.99
export const TAXA_PAGAMENTO_FIXA_CENTAVOS = 39

export const PRECO_MINIMO_CENTAVOS = 500

/** Calculada sobre o preço do produto (o frete não entra). */
export function taxaPagamentoCentavos(precoCentavos: number): number {
  return Math.round((precoCentavos * TAXA_PAGAMENTO_PERCENTUAL) / 100) + TAXA_PAGAMENTO_FIXA_CENTAVOS
}

/** Parte da Imperium em cada inscrição de evento pago (PaymentService.PLATFORM_FEE_PERCENTAGE). */
export const TAXA_PLATAFORMA_EVENTO_PERCENTUAL = 10

/**
 * Quanto o organizador recebe por inscrição: valor − 10% da Imperium − taxa de segurança.
 * Mesma conta do backend (StripeService.confirmAndFulfill): cada parte arredondada ao centavo.
 */
export function liquidoInscricaoCentavos(valorCentavos: number): number {
  if (valorCentavos <= 0) return 0
  const plataforma = Math.round((valorCentavos * TAXA_PLATAFORMA_EVENTO_PERCENTUAL) / 100)
  return valorCentavos - plataforma - taxaPagamentoCentavos(valorCentavos)
}
