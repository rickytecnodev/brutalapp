import { computed, onMounted, ref } from 'vue'
import type { OfflineStatusMap, Score } from '@/types/score'
import {
  isScoreCached,
  listCachedScoreUrls,
  removeScoreOffline,
  resolveScoreUrl,
  saveScoreOffline,
} from '@/services/offlineCache'

const offlineMap = ref<OfflineStatusMap>({})
const busyIds = ref<Record<string, boolean>>({})
const ready = ref(false)
let listenersAttached = false

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

  function isOffline(score: Score): boolean {
    return Boolean(offlineMap.value[resolveScoreUrl(score.pdf)])
  }

  function isBusy(scoreId: string): boolean {
    return Boolean(busyIds.value[scoreId])
  }

  async function save(score: Score): Promise<void> {
    if (busyIds.value[score.id]) return
    busyIds.value = { ...busyIds.value, [score.id]: true }
    try {
      await saveScoreOffline(score.pdf)
      offlineMap.value = {
        ...offlineMap.value,
        [resolveScoreUrl(score.pdf)]: true,
      }
    } finally {
      const nextBusy = { ...busyIds.value }
      delete nextBusy[score.id]
      busyIds.value = nextBusy
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

  return {
    ready,
    offlineMap,
    offlineCount,
    isOffline,
    isBusy,
    save,
    remove,
    toggle,
    ensureStatus,
    refresh: refreshFromCache,
  }
}
