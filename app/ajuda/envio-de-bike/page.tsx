import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, Box, CheckCircle2, Package, Ruler, Truck, Wrench } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Footer } from "@/components/layout/footer"
import { PageHeading } from "@/components/layout/page-heading"

export const metadata: Metadata = {
    title: "Como enviar uma bike | Imperium Bikes",
    description: "Passo a passo para embalar, medir e enviar uma bicicleta vendida pelo Imperium Bikes sem danos.",
}

const MATERIAIS = [
    "Caixa de bicicleta (peça grátis numa bicicletaria: elas recebem as bikes novas nessas caixas)",
    "Plástico bolha ou espuma (tubos de isolamento de cano servem muito bem)",
    "Fita adesiva larga e abraçadeiras de nylon (enforca-gato)",
    "Papelão extra para as pontas e para o fundo da caixa",
    "Saquinho com fecho para parafusos e peças pequenas",
    "Chaves Allen e de pedal, e uma fita métrica",
]

type Passo = { titulo: string; itens: string[]; alerta?: string }

const PASSOS: Passo[] = [
    {
        titulo: "Desmonte o que sai fácil",
        itens: [
            "Tire a roda dianteira. Se a bike for grande para a caixa, tire a traseira também.",
            "Tire os pedais. Atenção: o pedal esquerdo desrosqueia ao contrário (sentido horário).",
            "Solte o guidão da mesa e prenda-o ao lado do quadro, ou gire a mesa para ficar paralelo ao quadro.",
            "Abaixe o selim até o fim ou tire o canote e coloque-o na caixa.",
        ],
    },
    {
        titulo: "Proteja as partes delicadas",
        itens: [
            "Freio a disco hidráulico: coloque um calço (espaçador de plástico ou papelão dobrado) entre as pastilhas. Sem isso, se alguém apertar a manete, as pastilhas fecham.",
            "Embrulhe o câmbio traseiro em plástico bolha. Se der, solte-o da gancheira e prenda por dentro do quadro: é a peça que mais quebra no transporte.",
            "Coloque espaçadores nos garfos e no eixo traseiro, para não amassarem com peso em cima (bicicletarias costumam dar os de plástico).",
            "Cubra todos os tubos do quadro com espuma ou plástico bolha, presos com fita.",
            "Proteja os discos de freio com papelão, para não entortarem.",
        ],
    },
    {
        titulo: "Monte a caixa",
        itens: [
            "Forre o fundo com papelão extra.",
            "Coloque o quadro e prenda a roda solta ao lado dele com abraçadeiras, sem metal encostando em metal.",
            "Parafusos, pedais e peças pequenas no saquinho, bem preso dentro da caixa.",
            "Preencha os espaços vazios com papel ou papelão: nada pode ficar balançando quando você sacode a caixa.",
            "Feche com bastante fita e escreva FRÁGIL e ESTE LADO PARA CIMA nos lados.",
        ],
    },
    {
        titulo: "Pese e meça a caixa fechada",
        itens: [
            "Meça altura, largura e comprimento da caixa já fechada e arredonde para cima.",
            "Pese a caixa: suba na balança com ela e desconte o seu peso.",
            "Use essas medidas no anúncio, na etapa de frete. São elas que definem o preço e quais transportadoras aceitam.",
        ],
        alerta:
            "Medida errada é o problema mais comum: a transportadora cobra a diferença ou recusa a caixa. Na dúvida, informe a medida maior.",
    },
    {
        titulo: "Envie e acompanhe",
        itens: [
            "Depois da venda, envie pela transportadora que o comprador escolheu no checkout, dentro do prazo combinado.",
            "Guarde o comprovante de postagem e tire fotos da bike e da caixa antes de fechar: elas protegem você numa disputa.",
            "Se tiver dúvida no envio, fale com o comprador pelo chat do pedido.",
        ],
    },
]

export default function EnvioDeBikePage() {
    return (
        <AppShell>
            <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
                <PageHeading
                    title="Como enviar uma bike"
                    description="Bike é grande e delicada, mas com uma caixa bem montada ela chega inteira. Siga este passo a passo."
                    back={{ href: "/ajuda", label: "Central de Ajuda" }}
                />

                {/* Resumo: o que a caixa costuma ter */}
                <section aria-labelledby="medidas" className="mt-8 grid gap-3 sm:grid-cols-3">
                    <h2 id="medidas" className="sr-only">Medidas comuns</h2>
                    {[
                        { Icone: Ruler, rotulo: "Caixa de bike", valor: "cerca de 140 × 25 × 80 cm" },
                        { Icone: Package, rotulo: "Peso embalada", valor: "de 15 a 25 kg" },
                        { Icone: Truck, rotulo: "Quem leva", valor: "transportadoras para volumes grandes" },
                    ].map(({ Icone, rotulo, valor }) => (
                        <div key={rotulo} className="rounded-xl border border-border bg-surface p-4">
                            <Icone className="size-5 text-primary" aria-hidden="true" />
                            <p className="type-caption mt-2 text-muted-foreground">{rotulo}</p>
                            <p className="type-label mt-0.5 text-foreground">{valor}</p>
                        </div>
                    ))}
                </section>
                <p className="type-caption mt-3 text-muted-foreground">
                    Os Correios costumam limitar o volume a 30 kg e 100 cm no maior lado, então a maioria das caixas de bike vai por
                    transportadora. Na hora do frete, o app só mostra as opções que aceitam as medidas informadas.
                </p>

                <section aria-labelledby="materiais" className="mt-10">
                    <h2 id="materiais" className="type-h3 flex items-center gap-2 border-b border-border pb-2 text-foreground">
                        <Wrench className="size-5 text-primary" aria-hidden="true" />
                        O que você vai precisar
                    </h2>
                    <ul className="mt-4 flex flex-col gap-2">
                        {MATERIAIS.map((item) => (
                            <li key={item} className="type-body-small flex gap-2.5 text-foreground">
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                <ol className="mt-10 flex flex-col gap-8">
                    {PASSOS.map((passo, i) => (
                        <li key={passo.titulo}>
                            <h2 className="flex items-baseline gap-3">
                                <span className="text-sm font-bold tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
                                <span className="type-h3 text-foreground">{passo.titulo}</span>
                            </h2>
                            <ul className="mt-3 flex flex-col gap-2 border-l-2 border-border pl-5">
                                {passo.itens.map((item) => (
                                    <li key={item} className="type-body-small list-disc text-foreground/85 marker:text-primary">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            {passo.alerta && (
                                <p className="type-body-small mt-3 flex gap-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-foreground">
                                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                                    {passo.alerta}
                                </p>
                            )}
                        </li>
                    ))}
                </ol>

                <section aria-labelledby="alternativas" className="mt-12 rounded-2xl border border-border bg-surface p-5 sm:p-6">
                    <h2 id="alternativas" className="type-h3 flex items-center gap-2 text-foreground">
                        <Box className="size-5 text-primary" aria-hidden="true" />
                        Não quer embalar sozinho?
                    </h2>
                    <ul className="type-body-small mt-3 flex flex-col gap-2 text-muted-foreground">
                        <li>Muitas bicicletarias desmontam e embalam a bike por um valor pequeno. Vale perguntar na mais perto de você.</li>
                        <li>
                            Se comprador e vendedor forem da mesma cidade, a opção <strong className="text-foreground">Retirada no local</strong> evita
                            o frete: combine um lugar público e movimentado.
                        </li>
                    </ul>
                </section>

                <p className="type-body-small mt-8 text-muted-foreground">
                    Ainda com dúvida?{" "}
                    <Link href="/ajuda/contato" className="font-semibold text-primary hover:underline">
                        Fale com o suporte
                    </Link>
                    .
                </p>
            </main>
            <Footer />
        </AppShell>
    )
}
