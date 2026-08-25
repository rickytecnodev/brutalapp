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

async function assertPdfReachable(url: string, score: Score): Promise<void> {
  const response = await fetch(url, { method: 'GET', cache: 'no-store' })
  if (!response.ok) {
    if (score.missingPdf || response.status === 404) {
      throw new Error(missingPdfMessage(score))
    }
    throw new Error(`No se pudo cargar el PDF (${response.status}).`)
  }
  try {
    await response.body?.cancel()
  } catch {
    // ignore
  }
}

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

  const url = resolveScoreUrl(score.pdf)
  await assertPdfReachable(url, score)
  return url
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
