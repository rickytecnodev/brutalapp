/** Cache Storage dedicado a partituras guardadas por el usuario (no precache). */
export const SCORES_CACHE_NAME = 'scores-offline-v1'

export type ProgressCallback = (ratio: number) => void

/**
 * Resuelve la URL pública del PDF respetando el `base` de Vite
 * (necesario en GitHub Pages: /brutalapp/ y no la raíz del dominio).
 */
export function resolveScoreUrl(pdfPath: string): string {
  const clean = pdfPath.replace(/^\//, '')
  const base = import.meta.env.BASE_URL || './'
  const pageBase = window.location.href.replace(/#.*$/, '')
  return new URL(clean, new URL(base, pageBase)).href
}

export async function isCacheApiAvailable(): Promise<boolean> {
  return typeof window !== 'undefined' && 'caches' in window
}

export async function listCachedScoreUrls(): Promise<string[]> {
  if (!(await isCacheApiAvailable())) return []
  const cache = await caches.open(SCORES_CACHE_NAME)
  const keys = await cache.keys()
  return keys.map((req) => req.url)
}

export async function isScoreCached(pdfPath: string): Promise<boolean> {
  if (!(await isCacheApiAvailable())) return false
  const cache = await caches.open(SCORES_CACHE_NAME)
  const match = await cache.match(resolveScoreUrl(pdfPath))
  return Boolean(match)
}

export async function saveScoreOffline(
  pdfPath: string,
  onProgress?: ProgressCallback,
): Promise<void> {
  if (!(await isCacheApiAvailable())) {
    throw new Error('Cache Storage no está disponible en este navegador.')
  }

  const url = resolveScoreUrl(pdfPath)
  const response = await fetch(url, { cache: 'no-store' })

  if (!response.ok) {
    throw new Error(`No se pudo descargar la partitura (${response.status}).`)
  }

  const cache = await caches.open(SCORES_CACHE_NAME)
  const body = response.body

  if (!body || !onProgress) {
    await cache.put(url, response.clone())
    onProgress?.(1)
    return
  }

  const total = Number(response.headers.get('Content-Length') || 0)
  const reader = body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  onProgress(0)

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      chunks.push(value)
      received += value.byteLength
      if (total > 0) {
        onProgress(Math.min(0.99, received / total))
      } else {
        // Sin Content-Length: avance suave estimado
        onProgress(Math.min(0.92, 1 - 1 / (1 + received / 350_000)))
      }
    }
  }

  const blob = new Blob(chunks as BlobPart[], {
    type: response.headers.get('Content-Type') || 'application/pdf',
  })
  const headers = new Headers(response.headers)
  headers.set('Content-Length', String(blob.size))
  await cache.put(url, new Response(blob, { status: 200, headers }))
  onProgress(1)
}

export async function removeScoreOffline(pdfPath: string): Promise<void> {
  if (!(await isCacheApiAvailable())) return
  const cache = await caches.open(SCORES_CACHE_NAME)
  await cache.delete(resolveScoreUrl(pdfPath))
}

export async function getScoreBlobUrl(pdfPath: string): Promise<string | null> {
  if (!(await isCacheApiAvailable())) return null
  const cache = await caches.open(SCORES_CACHE_NAME)
  const match = await cache.match(resolveScoreUrl(pdfPath))
  if (!match) return null
  const blob = await match.blob()
  return URL.createObjectURL(blob)
}

export async function getCachedScoreResponse(pdfPath: string): Promise<Response | undefined> {
  if (!(await isCacheApiAvailable())) return undefined
  const cache = await caches.open(SCORES_CACHE_NAME)
  return cache.match(resolveScoreUrl(pdfPath))
}
