export interface Score {
  id: string
  title: string
  composer: string
  pdf: string
  /** Tonalidad (ej. "Do Mayor", "Fa menor") */
  tono?: string
  /**
   * Enlace de referencia para escuchar (YouTube, Spotify, etc.).
   * Si está vacío o ausente, el botón Escuchar queda bloqueado.
   */
  listenUrl?: string
  /** Nombre original del archivo (opcional, solo referencia) */
  sourceFile?: string
  /** true si el registro está en catálogo pero el PDF aún no se subió */
  missingPdf?: boolean
}

/** Entrada de lista (p. ej. Muerteada) con título limpio y PDF enlazado. */
export interface ScoreListItemModel extends Score {
  /** Clave estable en listas curadas (puede repetir scoreId). */
  listKey: string
}

export interface CatalogSetOption {
  id: string
  label: string
}

export interface CatalogSetEntry {
  id: string
  title: string
  scoreId: string
}

export type OfflineStatusMap = Record<string, boolean>

export function scoreTono(score: Pick<Score, 'tono'>): string {
  const value = score.tono?.trim()
  return value && value.length > 0 ? value : 'Do Mayor'
}

export function scoreListenUrl(score: Pick<Score, 'listenUrl'>): string | null {
  const value = score.listenUrl?.trim()
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.href
  } catch {
    return null
  }
}
