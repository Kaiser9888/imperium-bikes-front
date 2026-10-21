import type { Metadata } from "next"
import Link from "next/link"

import { Documento, Secao } from "@/components/legal/documento"

export const metadata: Metadata = {
    title: "Política de Reembolso | Imperium Bikes",
    description: "Arrependimento, devolução, produto com defeito, eventos e anúncios: quando e como você recebe o dinheiro de volta.",
}

const secoes = [
    { id: "resumo", titulo: "Resumo" },
    { id: "arrependimento", titulo: "Desistência da compra (7 dias)" },
    { id: "problema", titulo: "Produto com problema ou não recebido" },
    { id: "como", titulo: "Como pedir" },
    { id: "eventos", titulo: "Inscrições em eventos" },
    { id: "anuncios", titulo: "Anúncios e destaques" },
    { id: "prazos", titulo: "Como e quando o dinheiro volta" },
]

export default function ReembolsoPage() {
    return (
        <Documento
            titulo="Política de Reembolso"
            resumo="Quando você tem direito ao dinheiro de volta e como pedir, de acordo com o Código de Defesa do Consumidor."
            secoes={secoes}
        >
            <Secao id="resumo" titulo="1. Resumo">
                <ul>
                    <li>Comprou pelo app e desistiu? Você tem 7 dias a partir do recebimento para se arrepender.</li>
                    <li>Não recebeu ou veio diferente do anúncio? Abra uma disputa no pedido antes de o valor ser liberado ao vendedor.</li>
                    <li>Evento cancelado: reembolso automático. Desistiu do evento: cancele a inscrição até o início e receba de volta.</li>
                    <li>O dinheiro volta pelo Stripe, na mesma forma de pagamento usada na compra.</li>
                </ul>
            </Secao>

            <Secao id="arrependimento" titulo="2. Desistência da compra (7 dias)">
                <p>
                    Compras feitas pela internet podem ser canceladas em até <strong>7 dias corridos a partir do recebimento</strong>, sem
                    precisar justificar (Código de Defesa do Consumidor, art. 49). Nesse caso, todos os valores pagos, inclusive o frete,
                    são devolvidos.
                </p>
                <p>
                    O produto deve ser devolvido ao vendedor sem sinais de uso além do necessário para conferir. A forma de devolução é
                    combinada pelo chat com o vendedor; se não houver acordo, a equipe do Imperium Bikes decide a disputa.
                </p>
            </Secao>

            <Secao id="problema" titulo="3. Produto com problema ou não recebido">
                <ul>
                    <li>
                        <strong>Não chegou, chegou danificado ou diferente do anúncio:</strong> abra uma disputa pela página do pedido. O
                        prazo para isso é de 7 dias mais o prazo de entrega do frete, contado da compra. Enquanto a disputa estiver aberta, o
                        valor fica retido e não vai para o vendedor.
                    </li>
                    <li>
                        <strong>Defeito que aparece depois:</strong> você continua com os prazos do Código de Defesa do Consumidor para
                        reclamar (30 dias para produtos não duráveis e 90 dias para duráveis, art. 26). Se o valor já tiver sido liberado ao
                        vendedor, fale com o suporte pela <Link href="/ajuda/contato">Central de Ajuda</Link> para mediarmos o caso.
                    </li>
                </ul>
            </Secao>

            <Secao id="como" titulo="4. Como pedir">
                <ul>
                    <li>
                        Abra <Link href="/pedidos">Pedidos</Link>, escolha a compra e use a opção de disputa, explicando o problema.
                    </li>
                    <li>O vendedor pode aceitar o reembolso direto. Se ele não responder ou não concordar, a equipe analisa.</li>
                    <li>
                        Fora do app (pagamento combinado por fora) não há como protegermos a compra nem devolvermos o valor. Pague sempre
                        pelo app.
                    </li>
                </ul>
            </Secao>

            <Secao id="eventos" titulo="5. Inscrições em eventos">
                <ul>
                    <li>
                        <strong>Você desistiu:</strong> cancele a inscrição na página do evento a qualquer momento antes de ele começar. O
                        valor pago é devolvido integralmente.
                    </li>
                    <li>
                        <strong>O organizador cancelou</strong> ou o evento foi cancelado por não atingir o mínimo de inscritos: o
                        reembolso é automático, sem você precisar pedir.
                    </li>
                    <li>
                        Depois que o evento começa, a inscrição não é reembolsada pelo app; problemas com a realização do evento são
                        tratados com o organizador, e você pode pedir mediação pela Central de Ajuda.
                    </li>
                </ul>
            </Secao>

            <Secao id="anuncios" titulo="6. Anúncios e destaques">
                <ul>
                    <li>
                        <strong>Campanha de anúncio recusada na revisão:</strong> o valor é devolvido integralmente, automaticamente.
                    </li>
                    <li>
                        <strong>Desistência de campanha ou destaque:</strong> em até 7 dias da compra, se o serviço ainda não começou
                        (anúncio sem nenhuma exibição ou destaque ainda não ativo), peça o reembolso integral pela Central de Ajuda.
                    </li>
                    <li>
                        Depois que as exibições ou o destaque começam, o valor já consumido não é devolvido. O saldo não usado de uma
                        campanha pode ser pedido de volta pela Central de Ajuda.
                    </li>
                </ul>
            </Secao>

            <Secao id="prazos" titulo="7. Como e quando o dinheiro volta">
                <p>
                    O reembolso é feito pelo Stripe na mesma forma de pagamento da compra. No cartão de crédito, costuma aparecer em 5 a
                    10 dias úteis, podendo cair na fatura seguinte, conforme o banco emissor. Em outras formas de pagamento, o prazo depende
                    do meio usado. A situação do reembolso aparece em Pedidos.
                </p>
            </Secao>
        </Documento>
    )
}
