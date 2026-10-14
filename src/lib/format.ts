const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

/** Formata um valor em reais (não centavos) como moeda brasileira. */
export function formatarPreco(valor: number): string {
  return brl.format(valor)
}

/** Dia, mês e ano de uma data ISO (AAAA-MM-DD). Meio-dia evita cair no dia anterior por causa do fuso. */
export function partesDaData(iso: string): { dia: string; mes: string; ano: string } | null {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return null
  return {
    dia: String(d.getDate()).padStart(2, "0"),
    mes: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    ano: String(d.getFullYear()),
  }
}
