// Quanto cada venda custa e para quem. Mantenha igual a TaxaPagamento.java no backend e aos Termos (seção 5).
//
// Produto: o vendedor recebe 100% do preço. O comprador paga a Proteção Imperium, que cobre a tarifa do
// cartão sobre tudo o que ele paga e a parte do Imperium (3% do preço, no máximo R$ 60).
// Evento: o organizador recebe 90%; os 10% da Imperium já incluem a tarifa do cartão.

/** Tarifa do cartão no Stripe (3,99% + R$ 0,39). */
export const TAXA_PAGAMENTO_PERCENTUAL = 3.99
export const TAXA_PAGAMENTO_FIXA_CENTAVOS = 39

export const PERCENTUAL_IMPERIUM = 3
export const TETO_IMPERIUM_CENTAVOS = 6000

export const PRECO_MINIMO_CENTAVOS = 2000
export const INSCRICAO_MINIMA_CENTAVOS = 1000

/** freteServiceId de "Combinar envio com o vendedor" (StripeService.FRETE_COMBINADO). */
export const FRETE_COMBINADO = "COMBINADO"

/** Parte do Imperium numa venda: 3% do preço, no máximo R$ 60. */
export function imperiumCentavos(precoCentavos: number): number {
  return Math.min(Math.round((precoCentavos * PERCENTUAL_IMPERIUM) / 100), TETO_IMPERIUM_CENTAVOS)
}

/** Proteção Imperium paga pelo comprador (arredonda para cima, como o backend). */
export function protecaoCentavos(precoCentavos: number, freteCentavos = 0): number {
  const base = precoCentavos + freteCentavos
  const numerador = imperiumCentavos(precoCentavos) + (base * TAXA_PAGAMENTO_PERCENTUAL) / 100 + TAXA_PAGAMENTO_FIXA_CENTAVOS
  // O epsilon evita que um 146,0000001 de ponto flutuante vire 146,01
  return Math.ceil(numerador / (1 - TAXA_PAGAMENTO_PERCENTUAL / 100) - 1e-6)
}

/** Parte da Imperium em cada inscrição de evento pago, com o cartão incluído. */
export const TAXA_PLATAFORMA_EVENTO_PERCENTUAL = 10

/** Quanto o organizador recebe por inscrição: 90% do valor. */
export function liquidoInscricaoCentavos(valorCentavos: number): number {
  if (valorCentavos <= 0) return 0
  return valorCentavos - Math.round((valorCentavos * TAXA_PLATAFORMA_EVENTO_PERCENTUAL) / 100)
}
