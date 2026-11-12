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

/** Organizador digitou só o valor ("2000", "R$ 1.500"): mostra em reais. Texto livre fica como está. */
export function textoDaPremiacao(texto: string) {
    const limpo = texto.trim()
    if (!/^(R\$\s*)?\d{1,3}(\.?\d{3})*(,\d{1,2})?$/.test(limpo)) return limpo
    const valor = Number(limpo.replace(/R\$\s*/, "").replace(/\./g, "").replace(",", "."))
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: Number.isInteger(valor) ? 0 : 2 })
}
