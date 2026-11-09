/**
 * Limites de caixa das transportadoras do Melhor Envio que importam para bike.
 * Fonte: blog do Melhor Envio (nov/2026). Podem mudar: a cotação real é quem decide.
 */
export const CORREIOS = { pesoKg: 30, ladoCm: 100, somaCm: 200 }
/** Buslog (rodoviário, posta em agência na rodoviária): o que cabe uma bike desmontada. */
export const BUSLOG = { pesoKg: 50, ladosCm: [129, 85, 82] as const }

export type Caixa = { pesoKg: number; alturaCm: number; larguraCm: number; comprimentoCm: number }

export function cabeNosCorreios(c: Caixa) {
  const lados = [c.alturaCm, c.larguraCm, c.comprimentoCm]
  return c.pesoKg <= CORREIOS.pesoKg
    && Math.max(...lados) <= CORREIOS.ladoCm
    && lados.reduce((a, b) => a + b, 0) <= CORREIOS.somaCm
}

/** A caixa pode ir deitada de qualquer jeito: compara o maior lado com o maior limite, e assim por diante. */
export function cabeNaBuslog(c: Caixa) {
  const lados = [c.alturaCm, c.larguraCm, c.comprimentoCm].sort((a, b) => b - a)
  return c.pesoKg <= BUSLOG.pesoKg && lados.every((lado, i) => lado <= BUSLOG.ladosCm[i])
}

export const MEDIDA_BUSLOG = `${BUSLOG.ladosCm[0]} × ${BUSLOG.ladosCm[1]} × ${BUSLOG.ladosCm[2]} cm`
