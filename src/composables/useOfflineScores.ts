import { computed, onMounted, ref } from 'vue'
import type { OfflineStatusMap, Score } from '@/types/score'
import {
  isScoreCached,
  listCachedScoreUrls,
  removeScoreOffline,
  resolveScoreUrl,
  saveScoreOffline,
} from '@/services/offlineCache'

export interface BatchDownloadState {
  active: boolean
  currentTitle: string
  index: number
  total: number
  /** 0–1 del archivo actual */
  fileRatio: number
  /** 0–1 del lote completo */
  overallRatio: number
  errors: number
}

const offlineMap = ref<OfflineStatusMap>({})
const busyIds = ref<Record<string, boolean>>({})
/** Progreso 0–100 por id de partitura */
const progressById = ref<Record<string, number>>({})
const batch = ref<BatchDownloadState>({
  active: false,
  currentTitle: '',
  index: 0,
  total: 0,
  fileRatio: 0,
  overallRatio: 0,
  errors: 0,
})
const ready = ref(false)
let listenersAttached = false
let batchCancel = false

async function refreshFromCache(): Promise<void> {
  const urls = await listCachedScoreUrls()
  const next: OfflineStatusMap = {}
  for (const url of urls) {
    next[url] = true
  }
  offlineMap.value = next
  ready.value = true
}

function onOnline(): void {
  void refreshFromCache()
}

function setProgress(scoreId: string, ratio: number): void {
  progressById.value = {
    ...progressById.value,
    [scoreId]: Math.round(Math.min(100, Math.max(0, ratio * 100))),
  }
}

function clearProgress(scoreId: string): void {
  const next = { ...progressById.value }
  delete next[scoreId]
  progressById.value = next
}

export function useOfflineScores() {
  onMounted(() => {
    void refreshFromCache()
    if (!listenersAttached) {
      window.addEventListener('online', onOnline)
      listenersAttached = true
    }
  })

  const offlineCount = computed(
    () => Object.keys(offlineMap.value).filter((k) => offlineMap.value[k]).length,
  )

  const batchPercent = computed(() => Math.round(batch.value.overallRatio * 100))

  function isOffline(score: Score): boolean {
    return Boolean(offlineMap.value[resolveScoreUrl(score.pdf)])
  }

  function isBusy(scoreId: string): boolean {
    return Boolean(busyIds.value[scoreId])
  }

  function getProgress(scoreId: string): number | null {
    const value = progressById.value[scoreId]
    return typeof value === 'number' ? value : null
  }

  async function save(score: Score): Promise<void> {
    if (busyIds.value[score.id] || score.missingPdf) return
    if (isOffline(score)) return

    busyIds.value = { ...busyIds.value, [score.id]: true }
    setProgress(score.id, 0)
    try {
      await saveScoreOffline(score.pdf, (ratio) => setProgress(score.id, ratio))
      offlineMap.value = {
        ...offlineMap.value,
        [resolveScoreUrl(score.pdf)]: true,
      }
      setProgress(score.id, 1)
    } finally {
      const nextBusy = { ...busyIds.value }
      delete nextBusy[score.id]
      busyIds.value = nextBusy
      window.setTimeout(() => clearProgress(score.id), 450)
    }
  }

  async function remove(score: Score): Promise<void> {
    if (busyIds.value[score.id]) return
    busyIds.value = { ...busyIds.value, [score.id]: true }
    try {
      await removeScoreOffline(score.pdf)
      const url = resolveScoreUrl(score.pdf)
      const nextMap = { ...offlineMap.value }
      delete nextMap[url]
      offlineMap.value = nextMap
    } finally {
      const nextBusy = { ...busyIds.value }
      delete nextBusy[score.id]
      busyIds.value = nextBusy
    }
  }

  async function toggle(score: Score): Promise<void> {
    if (isOffline(score)) {
      await remove(score)
    } else {
      await save(score)
    }
  }

  async function ensureStatus(score: Score): Promise<boolean> {
    const cached = await isScoreCached(score.pdf)
    offlineMap.value = {
      ...offlineMap.value,
      [resolveScoreUrl(score.pdf)]: cached,
    }
    return cached
  }

  async function saveMany(scores: Score[]): Promise<void> {
    if (batch.value.active) return

    const queue = scores.filter((score) => !score.missingPdf && !isOffline(score))
    if (queue.length === 0) {
      window.alert('No hay partituras pendientes por descargar en esta lista.')
      return
    }

    batchCancel = false
    batch.value = {
      active: true,
      currentTitle: queue[0]?.title ?? '',
      index: 0,
      total: queue.length,
      fileRatio: 0,
      overallRatio: 0,
      errors: 0,
    }

    let errors = 0

    for (let i = 0; i < queue.length; i += 1) {
      if (batchCancel) break
      const score = queue[i]
      batch.value = {
        ...batch.value,
        currentTitle: score.title,
        index: i,
        fileRatio: 0,
        overallRatio: i / queue.length,
      }

      busyIds.value = { ...busyIds.value, [score.id]: true }
      setProgress(score.id, 0)

      try {
        await saveScoreOffline(score.pdf, (ratio) => {
          setProgress(score.id, ratio)
          batch.value = {
            ...batch.value,
            fileRatio: ratio,
            overallRatio: (i + ratio) / queue.length,
          }
        })
        offlineMap.value = {
          ...offlineMap.value,
          [resolveScoreUrl(score.pdf)]: true,
        }
        setProgress(score.id, 1)
      } catch {
        errors += 1
        batch.value = { ...batch.value, errors }
      } finally {
        const nextBusy = { ...busyIds.value }
        delete nextBusy[score.id]
        busyIds.value = nextBusy
        clearProgress(score.id)
      }
    }

    batch.value = {
      ...batch.value,
      active: false,
      fileRatio: 1,
      overallRatio: 1,
      errors,
    }

    window.setTimeout(() => {
      if (!batch.value.active) {
        batch.value = {
          active: false,
          currentTitle: '',
          index: 0,
          total: 0,
          fileRatio: 0,
          overallRatio: 0,
          errors: 0,
        }
      }
    }, 1800)
  }

  function cancelBatch(): void {
    batchCancel = true
  }

  return {
    ready,
    offlineMap,
    offlineCount,
    batch,
    batchPercent,
    isOffline,
    isBusy,
    getProgress,
    save,
    remove,
    toggle,
    saveMany,
    cancelBatch,
    ensureStatus,
    refresh: refreshFromCache,
  }
}
