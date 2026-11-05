import type { Metadata } from "next"
import Link from "next/link"

import { Documento, Secao } from "@/components/legal/documento"
import { formatarPreco } from "@/lib/format"
import { imperiumCentavos, protecaoCentavos } from "@/lib/taxas"

export const metadata: Metadata = {
    title: "Proteção Imperium | Imperium Bikes",
    description: "O que a Proteção Imperium garante, quanto custa e para onde vai cada real.",
}

const secoes = [
    { id: "garante", titulo: "O que ela garante" },
    { id: "custa", titulo: "Quanto custa" },
    { id: "vai", titulo: "Para onde vai a sua taxa" },
    { id: "vendedor", titulo: "Por que o vendedor não paga" },
]

const EXEMPLOS = [500, 2000, 5000]

export default function ProtecaoPage() {
    return (
        <Documento
            titulo="Proteção Imperium"
            resumo="Paga por quem compra, só quando compra. Segura o seu dinheiro até a bike chegar."
            secoes={secoes}
        >
            <Secao id="garante" titulo="1. O que ela garante">
                <ul>
                    <li>O seu pagamento fica retido e só vai para o vendedor depois que você recebe.</li>
                    <li>Se a bike não chegar ou não for como anunciada, você abre uma disputa e recebe o dinheiro de volta.</li>
                    <li>Na retirada em mãos e no envio combinado, o vendedor só recebe com o código que você passa ao conferir.</li>
                    <li>
                        No reembolso, a Proteção volta junto. Detalhes na <Link href="/reembolso">Política de Reembolso</Link>.
                    </li>
                </ul>
            </Secao>

            <Secao id="custa" titulo="2. Quanto custa">
                <p>
                    A tarifa do cartão (3,99% + R$ 0,39 sobre o que você paga) mais 3% do preço para o Imperium, no máximo R$ 60 por
                    item. O valor aparece na página do produto e no pagamento, antes de você pagar.
                </p>
                <ul>
                    {EXEMPLOS.map((reais) => {
                        const protecao = protecaoCentavos(reais * 100) / 100
                        return (
                            <li key={reais}>
                                Bike de {formatarPreco(reais)}: Proteção de {formatarPreco(protecao)}, total de{" "}
                                {formatarPreco(reais + protecao)} (sem o frete).
                            </li>
                        )
                    })}
                </ul>
            </Secao>

            <Secao id="vai" titulo="3. Para onde vai a sua taxa">
                <ul>
                    <li>
                        <strong>Cartão:</strong> a maior parte vai para o Stripe, que processa o pagamento e segura o dinheiro.
                    </li>
                    <li>
                        <strong>Imperium:</strong> no máximo {formatarPreco(imperiumCentavos(1_000_000) / 100)} por item. Paga os
                        servidores, o suporte e uma reserva para casos de golpe e contestação.
                    </li>
                </ul>
            </Secao>

            <Secao id="vendedor" titulo="4. Por que o vendedor não paga">
                <p>
                    Vender no Imperium não tem taxa: o vendedor recebe 100% do preço. Assim ele não precisa aumentar o preço da bike
                    para cobrir taxa, e você paga só a proteção, só quando compra.
                </p>
            </Secao>
        </Documento>
    )
}
