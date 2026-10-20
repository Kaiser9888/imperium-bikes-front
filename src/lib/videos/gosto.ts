/**
 * Gosto do usuário nos vídeos, só neste aparelho (localStorage): cada categoria tocada,
 * vídeo assistido ou curtido soma pontos para as hashtags dele. Os filtros "Para você"
 * da página de vídeos saem daqui.
 */

const CHAVE = "imperium-video-gosto"
const MAX_TAGS = 60

export const PESO = { filtro: 1, assistiu: 2, curtiu: 3 } as const

type Pontos = Record<string, number>

const normalizar = (tag: string) =>
  tag
    .trim()
    .replace(/^#/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")

function ler(): Pontos {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "{}")
    return salvo && typeof salvo === "object" ? (salvo as Pontos) : {}
  } catch {
    return {}
  }
}

export function registrarInteresse(tags: (string | undefined | null)[], peso: number) {
  const pontos = ler()
  for (const bruta of tags) {
    if (!bruta) continue
    const tag = normalizar(bruta)
    if (tag.length < 2 || tag.length > 30) continue
    pontos[tag] = (pontos[tag] ?? 0) + peso
  }
  // Mantém só as mais fortes para não crescer sem limite
  const enxuto = Object.fromEntries(Object.entries(pontos).sort((a, b) => b[1] - a[1]).slice(0, MAX_TAGS))
  try {
    localStorage.setItem(CHAVE, JSON.stringify(enxuto))
    window.dispatchEvent(new Event(CHAVE))
  } catch {
    // navegação privada ou armazenamento cheio: segue sem personalizar
  }
}

/** Tags em ordem de interesse (mais forte primeiro). */
export function interesses(): string[] {
  return Object.entries(ler())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
}

/** Avisa quando o gosto muda (outra aba ou outro componente). */
export function aoMudarGosto(callback: () => void): () => void {
  const handler = (event: Event) => {
    if (event instanceof StorageEvent && event.key !== CHAVE) return
    callback()
  }
  window.addEventListener(CHAVE, handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener(CHAVE, handler)
    window.removeEventListener("storage", handler)
  }
}
