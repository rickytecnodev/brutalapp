export interface Score {
  id: string
  title: string
  composer: string
  pdf: string
  /** Tonalidad (ej. "Do Mayor", "Fa menor") */
  tono?: string
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
