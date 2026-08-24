<template>
  <div class="page rise-in">
    <AppHeader :subtitle="headerSubtitle" />
    <InstallPrompt />
    <SetSelector v-model="activeSetId" :options="setOptions" />
    <SearchBar v-model="query" />
    <div class="stats">
      <span>{{ filteredScores.length }} resultado{{ filteredScores.length === 1 ? '' : 's' }}</span>
      <span v-if="offlineCount">{{ offlineCount }} offline</span>
    </div>
    <ScoreList
      :scores="filteredScores"
      empty-message="Ninguna partitura coincide con la búsqueda."
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import InstallPrompt from '@/components/InstallPrompt.vue'
import SearchBar from '@/components/SearchBar.vue'
import SetSelector from '@/components/SetSelector.vue'
import ScoreList from '@/components/ScoreList.vue'
import { useRepertoire } from '@/composables/useRepertoire'
import { useOfflineScores } from '@/composables/useOfflineScores'

const { query, filteredScores, totalCount, activeSetId, activeSet, setOptions } = useRepertoire()
const { offlineCount } = useOfflineScores()

const headerSubtitle = computed(() => {
  const setLabel = activeSet.value?.label ?? 'Repertorio'
  return `${setLabel} · ${totalCount.value} temas · toca uno para abrirlo`
})
</script>

<style scoped>
.page {
  display: grid;
  gap: 0.9rem;
}

.stats {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--ink-soft);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0 0.2rem;
}
</style>
