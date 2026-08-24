import { computed, ref } from 'vue'
import repertoireData from '@/data/repertoire.json'
import catalogSetsData from '@/data/catalogSets.json'
import type {
  CatalogSetEntry,
  CatalogSetOption,
  Score,
  ScoreListItemModel,
} from '@/types/score'

const scores = ref<Score[]>(repertoireData as Score[])
const query = ref('')
const activeSetId = ref((catalogSetsData as { defaultSetId: string }).defaultSetId || 'muerteada-2026')

const setOptions = (catalogSetsData as { sets: CatalogSetOption[] }).sets
const setEntries = (catalogSetsData as { entries: Record<string, CatalogSetEntry[]> }).entries

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function getById(id: string): Score | undefined {
  return scores.value.find((s) => s.id === id)
}

function toListItem(score: Score, listKey: string, titleOverride?: string): ScoreListItemModel {
  return {
    ...score,
    title: titleOverride ?? score.title,
    listKey,
  }
}

export function useRepertoire() {
  const activeSet = computed(
    () => setOptions.find((s) => s.id === activeSetId.value) ?? setOptions[0],
  )

  const baseList = computed<ScoreListItemModel[]>(() => {
    if (activeSetId.value === 'todos') {
      return scores.value.map((score) => toListItem(score, score.id))
    }

    const entries = setEntries[activeSetId.value] ?? []
    const items: ScoreListItemModel[] = []

    for (const entry of entries) {
      const score = getById(entry.scoreId)
      if (!score) continue
      items.push(toListItem(score, entry.id, entry.title))
    }

    return items
  })

  const filteredScores = computed(() => {
    const q = normalize(query.value)
    if (!q) return baseList.value

    return baseList.value.filter((score) => {
      const haystack = normalize(`${score.title} ${score.composer}`)
      return haystack.includes(q)
    })
  })

  function setActiveSet(id: string): void {
    activeSetId.value = id
  }

  return {
    scores,
    query,
    activeSetId,
    activeSet,
    setOptions,
    setActiveSet,
    filteredScores,
    totalCount: computed(() => baseList.value.length),
    catalogCount: computed(() => scores.value.length),
    getById,
  }
}
