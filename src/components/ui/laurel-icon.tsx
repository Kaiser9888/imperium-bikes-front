import { cn } from "@/lib/utils"

// Folha em amêndoa apontando para +x a partir da origem
const folha = (x: number, y: number, angulo: number) => (
    <path key={`${x}-${angulo}`} d="M0 0Q1.8-1.55 3.7 0Q1.8 1.55 0 0Z" transform={`translate(${x} ${y}) rotate(${angulo})`} />
)

// Pontos do ramo esquerdo (de baixo para cima) com a direção do caule em cada um
const PONTOS: [number, number, number][] = [
    [8.4, 20.0, -155],
    [6.3, 17.7, -125],
    [5.1, 14.6, -105],
    [4.75, 11.3, -93],
]

const ramo = (
    <>
        <path fill="none" strokeWidth={1.5} d="M11.2 21.2C6.8 19.8 4.4 15.6 4.8 8.2" />
        {PONTOS.flatMap(([x, y, t]) => [folha(x, y, t - 32), folha(x, y, t + 30)])}
        {folha(4.8, 8.4, -88)}
    </>
)

/** Coroa de louros no estilo dos ícones do Lucide (que não tem uma). Usa currentColor. */
export function LaurelIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={0.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn("size-6", className)}
        >
            <g>{ramo}</g>
            <g transform="translate(24 0) scale(-1 1)">{ramo}</g>
        </svg>
    )
}
