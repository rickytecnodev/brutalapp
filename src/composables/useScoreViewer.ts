import { ref } from 'vue'
import type { Score } from '@/types/score'
import { getScoreBlobUrl, isScoreCached, resolveScoreUrl } from '@/services/offlineCache'

const selected = ref<Score | null>(null)
const open = ref(false)
const src = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

let objectUrl: string | null = null

function clearObjectUrl(): void {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

async function assertPdfReachable(url: string, missingPdf?: boolean): Promise<void> {
  const response = await fetch(url, { method: 'GET', cache: 'no-store' })
  if (!response.ok) {
    throw new Error(
      missingPdf
        ? 'PDF pendiente: aún no está en public/scores/.'
        : `No se pudo cargar el PDF (${response.status}).`,
    )
  }
  // Consumir poco: no hace falta el body completo aquí; pdf.js vuelve a pedir la URL.
  try {
    await response.body?.cancel()
  } catch {
    // ignore
  }
}

async function resolveSource(score: Score): Promise<string> {
  const cached = await isScoreCached(score.pdf)
  if (cached) {
    const blobUrl = await getScoreBlobUrl(score.pdf)
    if (blobUrl) {
      objectUrl = blobUrl
      return blobUrl
    }
  }

  if (!navigator.onLine) {
    throw new Error('Sin conexión y esta partitura no está guardada offline.')
  }

  const url = resolveScoreUrl(score.pdf)
  await assertPdfReachable(url, score.missingPdf)
  return url
}

export function useScoreViewer() {
  async function openScore(score: Score): Promise<void> {
    selected.value = score
    open.value = true
    loading.value = true
    error.value = null
    clearObjectUrl()
    src.value = null

    try {
      src.value = await resolveSource(score)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudo abrir la partitura.'
    } finally {
      loading.value = false
    }
  }

  async function retry(): Promise<void> {
    if (!selected.value) return
    await openScore(selected.value)
  }

  function close(): void {
    open.value = false
    clearObjectUrl()
    src.value = null
    error.value = null
    loading.value = false
  }

  return {
    selected,
    open,
    src,
    loading,
    error,
    openScore,
    retry,
    close,
  }
}
