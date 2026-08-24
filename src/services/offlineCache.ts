/** Cache Storage dedicado a partituras guardadas por el usuario (no precache). */
export const SCORES_CACHE_NAME = 'scores-offline-v1'

export function resolveScoreUrl(pdfPath: string): string {
  const clean = pdfPath.startsWith('/') ? pdfPath : `/${pdfPath}`
  return new URL(clean, window.location.origin).href
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

export async function saveScoreOffline(pdfPath: string): Promise<void> {
  if (!(await isCacheApiAvailable())) {
    throw new Error('Cache Storage no está disponible en este navegador.')
  }

  const url = resolveScoreUrl(pdfPath)
  const response = await fetch(url, { cache: 'no-store' })

  if (!response.ok) {
    throw new Error(`No se pudo descargar la partitura (${response.status}).`)
  }

  const cache = await caches.open(SCORES_CACHE_NAME)
  await cache.put(url, response.clone())
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
