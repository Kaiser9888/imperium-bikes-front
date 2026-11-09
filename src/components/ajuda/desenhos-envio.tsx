/**
 * Desenhos da cartilha de envio de bike. SVG simples com currentColor, para funcionar no tema claro e escuro.
 * Cada desenho tem aria-label: quem usa leitor de tela ouve o que ele mostra.
 */
import { BUSLOG } from "@/lib/frete-limites"

const traco = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const

/** Ponta de seta em (x, y) apontando no ângulo (graus). */
function Ponta({ x, y, angulo }: { x: number; y: number; angulo: number }) {
    return <path d="M -7 -5 L 0 0 L -7 5" transform={`translate(${x} ${y}) rotate(${angulo})`} {...traco} />
}

/** Bike montada → caixa com quadro e rodas lado a lado, com as medidas máximas. */
export function DesenhoBikeNaCaixa() {
    const [comprimento, largura, altura] = BUSLOG.ladosCm
    return (
        <svg
            viewBox="0 0 645 250"
            role="img"
            aria-label={`À esquerda, a bike montada. À direita, a mesma bike desmontada dentro de uma caixa de até ${comprimento} centímetros de comprimento por ${altura} de altura: o quadro sem rodas, com as duas rodas encostadas ao lado.`}
            className="h-auto w-full"
        >
            {/* Bike montada */}
            <g className="text-foreground">
                <circle cx="60" cy="150" r="48" {...traco} />
                <circle cx="200" cy="150" r="48" {...traco} />
                <path d="M60 150 L118 154 L105 86 Z M105 86 L180 82 L118 154 M180 82 L200 150 M180 82 L176 66 L166 60 M105 86 L101 70 M88 68 L114 68" {...traco} />
                <circle cx="118" cy="154" r="6" {...traco} />
            </g>
            <text x="130" y="232" textAnchor="middle" className="fill-muted-foreground text-[20px]">Montada</text>

            {/* Seta */}
            <g className="text-primary">
                <path d="M262 140 L312 140" {...traco} />
                <Ponta x={314} y={140} angulo={0} />
            </g>

            {/* Caixa: 1,9 px por cm */}
            <g className="text-muted-foreground">
                <rect x="340" y="40" width="245" height="156" rx="4" {...traco} strokeDasharray="0" />
            </g>
            <g className="text-foreground" opacity="0.55">
                <circle cx="420" cy="118" r="70" {...traco} strokeWidth={2.5} />
                <circle cx="505" cy="118" r="70" {...traco} strokeWidth={2.5} />
            </g>
            <g className="text-primary">
                {/* quadro sem rodas, garfo com espaçador */}
                <path d="M372 140 L450 150 L432 78 Z M432 78 L530 72 L450 150 M530 72 L556 146 M548 146 L564 146" {...traco} />
                {/* guidão solto, preso ao lado do quadro */}
                <path d="M440 64 L520 60" {...traco} strokeWidth={4} />
                {/* saquinho com pedais e parafusos */}
                <rect x="368" y="160" width="26" height="22" rx="4" {...traco} strokeWidth={2.5} />
            </g>

            {/* Medidas */}
            <g className="text-muted-foreground">
                <path d="M340 214 L585 214 M340 208 L340 220 M585 208 L585 220" {...traco} strokeWidth={2} />
                <path d="M604 40 L604 196 M598 40 L610 40 M598 196 L610 196" {...traco} strokeWidth={2} />
            </g>
            <text x="462" y="238" textAnchor="middle" className="fill-foreground text-[20px] font-semibold">até {comprimento} cm</text>
            <text x="626" y="118" textAnchor="middle" className="fill-foreground text-[20px] font-semibold" transform="rotate(-90 626 118)">até {altura} cm</text>
            <text x="462" y="28" textAnchor="middle" className="fill-muted-foreground text-[17px]">largura até {largura} cm · até {BUSLOG.pesoKg} kg</text>
        </svg>
    )
}

type Mini = { titulo: string; legenda: string; rotulo: string; desenho: React.ReactNode }

const MINIS: Mini[] = [
    {
        titulo: "Tire as duas rodas",
        legenda: "Abra a blocagem ou o eixo passante e puxe a roda para fora do garfo e do quadro.",
        rotulo: "Roda saindo do garfo, com uma seta mostrando o sentido.",
        desenho: (
            <>
                <g className="text-foreground">
                    <path d="M30 12 L48 58" {...traco} />
                    <circle cx="76" cy="56" r="28" {...traco} opacity="0.6" />
                    <circle cx="76" cy="56" r="4" {...traco} />
                </g>
                <g className="text-primary">
                    <path d="M58 26 L100 10" {...traco} />
                    <Ponta x={102} y={9} angulo={-21} />
                </g>
            </>
        ),
    },
    {
        titulo: "Tire os pedais",
        legenda: "Olhando de fora: o direito solta no sentido anti-horário, o esquerdo no horário (rosca invertida).",
        rotulo: "Dois pedais. O direito com seta anti-horária, o esquerdo com seta horária.",
        desenho: (
            <>
                <g className="text-foreground">
                    <rect x="14" y="44" width="34" height="14" rx="4" {...traco} />
                    <rect x="72" y="44" width="34" height="14" rx="4" {...traco} />
                </g>
                <g className="text-primary">
                    {/* esquerdo: horário */}
                    <path d="M18 34 A 16 16 0 0 1 46 30" {...traco} />
                    <Ponta x={46} y={31} angulo={45} />
                    {/* direito: anti-horário */}
                    <path d="M102 34 A 16 16 0 0 0 74 30" {...traco} />
                    <Ponta x={74} y={31} angulo={135} />
                </g>
                <text x="31" y="82" textAnchor="middle" className="fill-muted-foreground text-[13px]">esquerdo</text>
                <text x="89" y="82" textAnchor="middle" className="fill-muted-foreground text-[13px]">direito</text>
            </>
        ),
    },
    {
        titulo: "Solte o guidão",
        legenda: "Tire o guidão da mesa e prenda ao lado do quadro com abraçadeiras, sem dobrar os cabos.",
        rotulo: "Visto de cima: guidão deitado paralelo ao quadro.",
        desenho: (
            <>
                <g className="text-foreground">
                    <path d="M14 56 L106 56" {...traco} />
                </g>
                <g className="text-primary">
                    <path d="M24 40 L96 40" {...traco} strokeWidth={4} />
                    <path d="M40 40 L40 56 M80 40 L80 56" {...traco} strokeWidth={2} strokeDasharray="3 4" />
                </g>
            </>
        ),
    },
    {
        titulo: "Calço no freio",
        legenda: "Freio hidráulico: ponha um calço entre as pastilhas. Sem ele, um aperto na manete fecha tudo.",
        rotulo: "Pinça de freio com um calço entre as duas pastilhas.",
        desenho: (
            <>
                <g className="text-foreground">
                    <rect x="34" y="22" width="52" height="46" rx="8" {...traco} />
                    <path d="M48 32 L48 58 M72 32 L72 58" {...traco} />
                </g>
                <g className="text-primary">
                    <rect x="54" y="14" width="12" height="62" rx="2" {...traco} />
                </g>
            </>
        ),
    },
    {
        titulo: "Proteja o câmbio",
        legenda: "Solte o câmbio traseiro da gancheira e embrulhe em plástico bolha, preso por dentro do quadro.",
        rotulo: "Câmbio traseiro embrulhado e preso por dentro do quadro.",
        desenho: (
            <>
                <g className="text-foreground">
                    <path d="M14 30 L70 60 M14 70 L70 60" {...traco} />
                </g>
                <g className="text-primary">
                    <rect x="38" y="36" width="40" height="34" rx="12" {...traco} strokeDasharray="5 4" />
                    <circle cx="58" cy="53" r="6" {...traco} />
                </g>
            </>
        ),
    },
    {
        titulo: "Meça e pese a caixa",
        legenda: "Caixa já fechada: os três lados, arredondando para cima. Suba na balança com ela e desconte o seu peso.",
        rotulo: "Caixa fechada com uma fita métrica ao longo dela e uma balança ao lado.",
        desenho: (
            <>
                <g className="text-foreground">
                    <rect x="10" y="30" width="70" height="40" rx="3" {...traco} />
                    <path d="M10 30 L22 18 L92 18 L80 30 M92 18 L92 58 L80 70" {...traco} />
                </g>
                <g className="text-primary">
                    <path d="M10 80 L80 80 M10 76 L10 84 M80 76 L80 84 M28 78 L28 82 M45 78 L45 82 M62 78 L62 82" {...traco} strokeWidth={2} />
                    <rect x="96" y="56" width="20" height="16" rx="3" {...traco} strokeWidth={2.5} />
                    <path d="M101 64 L111 64" {...traco} strokeWidth={2} />
                </g>
            </>
        ),
    },
]

/** Grade de desenhos pequenos, um por passo da desmontagem e da medição. */
export function DesenhosPassoAPasso() {
    return (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MINIS.map((m) => (
                <li key={m.titulo} className="flex flex-col rounded-xl border border-border bg-surface p-3">
                    <svg viewBox="0 0 120 90" role="img" aria-label={m.rotulo} className="h-auto w-full">
                        {m.desenho}
                    </svg>
                    <p className="type-label mt-2 text-foreground">{m.titulo}</p>
                    <p className="type-caption mt-0.5 text-muted-foreground">{m.legenda}</p>
                </li>
            ))}
        </ul>
    )
}
