import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, Box, CheckCircle2, Handshake, MessageCircle, Package, Ruler, Truck, Weight, Wrench } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Footer } from "@/components/layout/footer"
import { PageHeading } from "@/components/layout/page-heading"
import { DesenhoBikeNaCaixa, DesenhosPassoAPasso } from "@/components/ajuda/desenhos-envio"
import { BUSLOG, CORREIOS, MEDIDA_BUSLOG } from "@/lib/frete-limites"

export const metadata: Metadata = {
    title: "Como enviar uma bike | Imperium Bikes",
    description: "Passo a passo com desenhos para desmontar, embalar, medir e enviar uma bicicleta vendida pelo Imperium Bikes, e o que fazer se você não quer ou não consegue enviar.",
}

const MATERIAIS = [
    "Caixa de bicicleta (peça grátis numa bicicletaria: elas recebem as bikes novas nessas caixas). Se ficar grande, corte e refaça com fita.",
    "Plástico bolha ou espuma (tubos de isolamento de cano servem muito bem)",
    "Fita adesiva larga e abraçadeiras de nylon (enforca-gato)",
    "Papelão extra para as pontas e para o fundo da caixa",
    "Saquinho com fecho para parafusos e peças pequenas",
    "Chaves Allen e de pedal, e uma fita métrica",
]

type Passo = { titulo: string; itens: string[]; alerta?: string }

const PASSOS: Passo[] = [
    {
        titulo: "Desmonte",
        itens: [
            "Tire as duas rodas. Com elas no lugar, a bike passa de 150 cm e nenhuma transportadora do site leva.",
            "Tire os pedais. O pedal esquerdo desrosqueia ao contrário (sentido horário, olhando de fora).",
            "Solte o guidão da mesa e prenda-o ao lado do quadro com abraçadeiras, sem dobrar nem esticar os cabos.",
            "Tire o canote com o selim e coloque na caixa, embrulhado.",
        ],
    },
    {
        titulo: "Proteja as partes delicadas",
        itens: [
            "Freio a disco hidráulico: coloque um calço (espaçador de plástico ou papelão dobrado) entre as pastilhas. Sem isso, se alguém apertar a manete, as pastilhas fecham.",
            "Embrulhe o câmbio traseiro em plástico bolha. Se der, solte-o da gancheira e prenda por dentro do quadro: é a peça que mais quebra no transporte.",
            "Coloque espaçadores no garfo e no eixo traseiro, para não amassarem com peso em cima (bicicletarias costumam dar os de plástico).",
            "Cubra todos os tubos do quadro com espuma ou plástico bolha, presos com fita.",
            "Tire os discos de freio ou proteja-os com papelão, para não entortarem.",
        ],
    },
    {
        titulo: "Monte a caixa",
        itens: [
            "Forre o fundo com papelão extra.",
            "Coloque o quadro e as duas rodas encostadas ao lado dele, presas com abraçadeiras, sem metal encostando em metal (papelão entre eles).",
            "Pedais, parafusos e peças pequenas no saquinho, bem preso dentro da caixa.",
            "Preencha os espaços vazios com papel ou papelão: nada pode ficar balançando quando você sacode a caixa.",
            "Feche com bastante fita e escreva FRÁGIL e ESTE LADO PARA CIMA nos lados.",
        ],
    },
    {
        titulo: "Meça e pese a caixa fechada",
        itens: [
            "Meça altura, largura e comprimento da caixa já fechada e arredonde para cima.",
            "Pese a caixa: suba na balança com ela e desconte o seu peso.",
            `Para ir pelo site, a caixa precisa ter até ${MEDIDA_BUSLOG} e ${BUSLOG.pesoKg} kg.`,
            "Use essas medidas no anúncio, na etapa de frete. São elas que definem o preço e quais transportadoras aceitam.",
        ],
        alerta:
            "Medida errada é o problema mais comum: a transportadora confere na postagem e cobra a diferença ou recusa a caixa. Na dúvida, informe a medida maior.",
    },
    {
        titulo: "Envie e acompanhe",
        itens: [
            "Depois da venda, envie pela transportadora que o comprador escolheu, dentro de 3 dias úteis.",
            "Correios: qualquer agência. Buslog e outras transportadoras: leve a caixa à agência indicada no pedido (a da Buslog costuma ficar na rodoviária).",
            "Guarde o comprovante de postagem e tire fotos da bike e da caixa antes de fechar: elas protegem você numa disputa.",
            "Se tiver dúvida no envio, fale com o comprador pelo chat do pedido.",
        ],
    },
]

const CAMINHOS = [
    {
        Icone: Truck,
        titulo: "Enviar pelo site",
        texto: `Para quem consegue embalar. Peças pequenas vão pelos Correios; bike desmontada, na caixa de até ${MEDIDA_BUSLOG}, vai pela transportadora rodoviária. O frete é calculado na compra e o comprador acompanha o rastreio.`,
        destaque: false,
    },
    {
        Icone: MessageCircle,
        titulo: "Combinar o envio",
        texto: "Quando a caixa não cabe ou não há agência perto: o comprador escolhe “Combinar envio com o vendedor” na compra e vocês acertam ônibus ou transportadora pelo chat. O frete é pago direto entre vocês.",
        destaque: false,
    },
    {
        Icone: Handshake,
        titulo: "Não vou enviar",
        texto: "Se você não quer ou não consegue enviar, marque “Não vou enviar: retirada no local ou em local combinado” ao anunciar. O comprador busca com você ou vocês se encontram num lugar combinado.",
        destaque: true,
    },
]

export default function EnvioDeBikePage() {
    return (
        <AppShell footer={<Footer />}>
            <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
                <PageHeading
                    title="Como enviar uma bike"
                    description="Bike inteira cabe numa caixa se for desmontada. Este passo a passo mostra como, e o que fazer se você não quer ou não consegue enviar."
                    back={{ href: "/ajuda", label: "Central de Ajuda" }}
                />

                <figure className="mt-8 rounded-2xl border border-border bg-surface p-4 sm:p-6">
                    <DesenhoBikeNaCaixa />
                    <figcaption className="type-caption mt-3 text-muted-foreground">
                        Sem as rodas, o quadro fica com uns 115 a 125 cm. As rodas vão encostadas ao lado dele, na mesma caixa.
                    </figcaption>
                </figure>

                <section aria-labelledby="medidas" className="mt-6 grid gap-3 sm:grid-cols-3">
                    <h2 id="medidas" className="sr-only">Limites da caixa</h2>
                    {[
                        { Icone: Ruler, rotulo: "Caixa da bike desmontada", valor: `até ${MEDIDA_BUSLOG}` },
                        { Icone: Weight, rotulo: "Peso embalada", valor: `até ${BUSLOG.pesoKg} kg (costuma dar 15 a 25 kg)` },
                        { Icone: Package, rotulo: "Peças e acessórios", valor: `Correios: até ${CORREIOS.pesoKg} kg e ${CORREIOS.ladoCm} cm por lado` },
                    ].map(({ Icone, rotulo, valor }) => (
                        <div key={rotulo} className="rounded-xl border border-border bg-surface p-4">
                            <Icone className="size-5 text-primary" aria-hidden="true" />
                            <p className="type-caption mt-2 text-muted-foreground">{rotulo}</p>
                            <p className="type-label mt-0.5 text-foreground">{valor}</p>
                        </div>
                    ))}
                </section>
                <p className="type-caption mt-3 text-muted-foreground">
                    Limites das transportadoras do Melhor Envio, que podem mudar. Na compra, o site só mostra quem aceita a sua caixa e tem
                    agência na sua cidade.
                </p>

                <section aria-labelledby="caminhos" className="mt-10">
                    <h2 id="caminhos" className="type-h3 border-b border-border pb-2 text-foreground">Antes de tudo: você vai enviar?</h2>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                        {CAMINHOS.map(({ Icone, titulo, texto, destaque }) => (
                            <li
                                key={titulo}
                                className={
                                    destaque
                                        ? "rounded-xl border-2 border-primary bg-primary/5 p-4"
                                        : "rounded-xl border border-border bg-surface p-4"
                                }
                            >
                                <Icone className="size-5 text-primary" aria-hidden="true" />
                                <p className="type-label mt-2 text-foreground">{titulo}</p>
                                <p className="type-caption mt-1 text-muted-foreground">{texto}</p>
                            </li>
                        ))}
                    </ul>
                    <p className="type-body-small mt-3 text-foreground">
                        Nos três casos o comprador paga pelo site e o dinheiro só é liberado quando a bike chega (ou quando ele te passa o código
                        na entrega). Nunca aceite pagamento por fora.
                    </p>
                </section>

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

                <section aria-labelledby="visual" className="mt-10">
                    <h2 id="visual" className="type-h3 border-b border-border pb-2 text-foreground">Passo a passo em desenhos</h2>
                    <div className="mt-4">
                        <DesenhosPassoAPasso />
                    </div>
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
                            Quadro grande de downhill pode não caber em {MEDIDA_BUSLOG} mesmo desmontado. Nesse caso, o comprador pode escolher{" "}
                            <strong className="text-foreground">Combinar envio com o vendedor</strong>, ou você anuncia com{" "}
                            <strong className="text-foreground">Não vou enviar: retirada no local ou em local combinado</strong>.
                        </li>
                        <li>
                            Na retirada, combine um lugar público e movimentado (ou uma bicicletaria), e só entregue a bike depois de receber o código
                            do comprador.
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
        </AppShell>
    )
}
