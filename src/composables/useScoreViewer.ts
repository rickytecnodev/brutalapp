import { ref } from 'vue'
import type { Score } from '@/types/score'
import { scoreTono } from '@/types/score'
import { getScoreBlobUrl, isScoreCached, resolveScoreUrl } from '@/services/offlineCache'

const selected = ref<Score | null>(null)
const open = ref(false)
const src = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const unavailableTone = ref<string | null>(null)

let objectUrl: string | null = null

function clearObjectUrl(): void {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

function missingPdfMessage(score: Score): string {
  const tono = scoreTono(score)
  return `El PDF no está disponible por ahora. La tonalidad es ${tono}.`
}

/**
 * Resuelve la fuente sin descargar el PDF completo aquí.
 * pdf.js hace una sola descarga (con streaming).
 */
async function resolveSource(score: Score): Promise<string> {
  if (score.missingPdf) {
    throw new Error(missingPdfMessage(score))
  }

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

  return resolveScoreUrl(score.pdf)
}

export function useScoreViewer() {
  async function openScore(score: Score): Promise<void> {
    selected.value = score
    open.value = true
    loading.value = true
    error.value = null
    unavailableTone.value = null
    clearObjectUrl()
    src.value = null

    try {
      src.value = await resolveSource(score)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo abrir la partitura.'
      error.value = message
      if (score.missingPdf || message.includes('tonalidad')) {
        unavailableTone.value = scoreTono(score)
      }
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
    unavailableTone.value = null
    loading.value = false
  }

  return {
    selected,
    open,
    src,
    loading,
    error,
    unavailableTone,
    openScore,
    retry,
    close,
  }
}
