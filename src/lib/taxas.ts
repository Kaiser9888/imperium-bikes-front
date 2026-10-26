// Taxa de pagamento e preço mínimo dos anúncios.
// Mantenha igual a TaxaPagamento.java no backend e aos Termos (seção 5).

/** Tarifa do cartão no Stripe (3,99% + R$ 0,39), descontada do vendedor em cada venda. */
export const TAXA_PAGAMENTO_PERCENTUAL = 3.99
export const TAXA_PAGAMENTO_FIXA_CENTAVOS = 39

export const PRECO_MINIMO_CENTAVOS = 500

/** Calculada sobre o preço do produto (o frete não entra). */
export function taxaPagamentoCentavos(precoCentavos: number): number {
  return Math.round((precoCentavos * TAXA_PAGAMENTO_PERCENTUAL) / 100) + TAXA_PAGAMENTO_FIXA_CENTAVOS
}
