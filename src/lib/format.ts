const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

/** Formata um valor em reais (não centavos) como moeda brasileira. */
export function formatarPreco(valor: number): string {
  return brl.format(valor)
}
