"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react"
import { useLayoutEffect, useRef, useState } from "react"
import { ProductImage } from "@/components/marketplace/ProductImage"

const ZOOM_TOQUE = 2.5
const ZOOM_MAX = 4

type Props = {
  imagens: string[]
  indice: number
  onIndice: (i: number) => void
  aberta: boolean
  onAberta: (v: boolean) => void
  alt: string
}

/** Foto em tela cheia: toque (ou duplo clique) amplia no ponto tocado, pinça com dois dedos e arrasta para mover. */
export function GaleriaTelaCheia({ imagens, indice, onIndice, aberta, onAberta, alt }: Props) {
  const area = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  // Ponto (0–1 da imagem) que deve ficar sob o dedo/cursor depois de mudar o zoom
  const foco = useRef<{ fx: number; fy: number; cx: number; cy: number } | null>(null)
  const pinca = useRef<{ dist: number; zoom: number } | null>(null)
  const toque = useRef<{ x: number; y: number; t: number; moveu: boolean } | null>(null)

  useLayoutEffect(() => {
    const el = area.current
    const f = foco.current
    if (!el || !f) return
    el.scrollLeft = f.fx * el.scrollWidth - f.cx
    el.scrollTop = f.fy * el.scrollHeight - f.cy
    foco.current = null
  }, [zoom])

  function mudarZoom(novo: number, clientX?: number, clientY?: number) {
    const el = area.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = (clientX ?? r.left + r.width / 2) - r.left
    const cy = (clientY ?? r.top + r.height / 2) - r.top
    foco.current = { fx: (el.scrollLeft + cx) / el.scrollWidth, fy: (el.scrollTop + cy) / el.scrollHeight, cx, cy }
    setZoom(Math.min(ZOOM_MAX, Math.max(1, novo)))
  }

  function alternar(clientX: number, clientY: number) {
    mudarZoom(zoom > 1 ? 1 : ZOOM_TOQUE, clientX, clientY)
  }

  function irPara(i: number) {
    setZoom(1)
    onIndice((i + imagens.length) % imagens.length)
  }

  const distancia = (t: React.TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)

  return (
    <DialogPrimitive.Root
      open={aberta}
      onOpenChange={(v) => {
        setZoom(1)
        onAberta(v)
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col bg-black text-white outline-none"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" && imagens.length > 1) irPara(indice - 1)
            if (e.key === "ArrowRight" && imagens.length > 1) irPara(indice + 1)
          }}
        >
          <DialogPrimitive.Title className="sr-only">{alt}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Toque na foto para ampliar. Use dois dedos para aproximar e arraste para mover.
          </DialogPrimitive.Description>

          <div className="flex items-center justify-between gap-2 p-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
            <span className="type-caption px-2 tabular-nums text-white/80">
              {imagens.length > 1 && `${indice + 1} / ${imagens.length}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => mudarZoom(zoom > 1 ? 1 : ZOOM_TOQUE)}
                className="grid size-11 place-items-center rounded-full hover:bg-white/10"
                aria-label={zoom > 1 ? "Diminuir zoom" : "Ampliar foto"}
              >
                {zoom > 1 ? <ZoomOut className="size-5" /> : <ZoomIn className="size-5" />}
              </button>
              <DialogPrimitive.Close className="grid size-11 place-items-center rounded-full hover:bg-white/10" aria-label="Fechar">
                <X className="size-6" />
              </DialogPrimitive.Close>
            </div>
          </div>

          <div
            ref={area}
            className="relative min-h-0 flex-1 overflow-auto overscroll-contain [scrollbar-width:none]"
            style={{ touchAction: zoom > 1 ? "pan-x pan-y" : "pan-y" }}
            onDoubleClick={(e) => alternar(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              if (e.touches.length === 2) {
                pinca.current = { dist: distancia(e.touches), zoom }
                toque.current = null
              } else if (e.touches.length === 1) {
                toque.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now(), moveu: false }
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 2 && pinca.current) {
                const meio = { x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 }
                mudarZoom((pinca.current.zoom * distancia(e.touches)) / pinca.current.dist, meio.x, meio.y)
              } else if (toque.current) {
                const t = e.touches[0]
                if (Math.hypot(t.clientX - toque.current.x, t.clientY - toque.current.y) > 10) toque.current.moveu = true
              }
            }}
            onTouchEnd={(e) => {
              if (e.touches.length < 2) pinca.current = null
              const t = toque.current
              toque.current = null
              if (!t || e.changedTouches.length !== 1) return
              const fim = e.changedTouches[0]
              const dx = fim.clientX - t.x
              // Sem zoom, arrastar de lado troca de foto
              if (zoom === 1 && imagens.length > 1 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(fim.clientY - t.y)) {
                irPara(indice + (dx < 0 ? 1 : -1))
              } else if (!t.moveu && Date.now() - t.t < 300) {
                e.preventDefault() // evita o duplo clique sintético
                alternar(fim.clientX, fim.clientY)
              }
            }}
          >
            <div style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
              <ProductImage
                src={imagens[indice]}
                alt={alt}
                className="h-full w-full select-none object-contain"
              />
            </div>
          </div>

          {imagens.length > 1 && (
            <div className="flex items-center justify-center gap-6 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => irPara(indice - 1)}
                className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => irPara(indice + 1)}
                className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Próxima foto"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
