/**
 * Etiqueta automática: depois da venda o site compra a etiqueta no Melhor Envio e o vendedor só imprime.
 * Acompanha a chave MELHOR_ENVIO_ETIQUETAS do backend; ligue as duas juntas (NEXT_PUBLIC_ETIQUETA_AUTOMATICA=1 na Vercel).
 * Só muda textos e atalhos: a tela de Pedidos segue o que o backend diz de cada pedido.
 */
export const ETIQUETA_AUTOMATICA = process.env.NEXT_PUBLIC_ETIQUETA_AUTOMATICA === "1"
