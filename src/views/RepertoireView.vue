<template>
  <div class="page rise-in">
    <AppHeader :subtitle="headerSubtitle" />
    <InstallPrompt />
    <SearchBar v-model="query" />
    <div class="toolbar">
      <div class="stats">
        <span>{{ filteredScores.length }} resultado{{ filteredScores.length === 1 ? '' : 's' }}</span>
        <span v-if="offlineCount">{{ offlineCount }} offline</span>
      </div>
      <button
        type="button"
        class="btn btn-primary download-all"
        :disabled="batch.active || pendingDownloadCount === 0"
        @click="onDownloadAll"
      >
        {{ batch.active ? `Descargando ${batchPercent}%` : 'Descargar todos' }}
      </button>
    </div>
    <p v-if="pendingDownloadCount > 0 && !batch.active" class="hint">
      {{ pendingDownloadCount }} partitura{{ pendingDownloadCount === 1 ? '' : 's' }} de esta lista
      pendientes de guardar offline.
    </p>
    <ScoreList
      :scores="filteredScores"
      empty-message="Ninguna partitura coincide con la búsqueda."
    />
    <DownloadProgressPanel />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import InstallPrompt from '@/components/InstallPrompt.vue'
import SearchBar from '@/components/SearchBar.vue'
import ScoreList from '@/components/ScoreList.vue'
import DownloadProgressPanel from '@/components/DownloadProgressPanel.vue'
import { useRepertoire } from '@/composables/useRepertoire'
import { useOfflineScores } from '@/composables/useOfflineScores'

const { query, filteredScores, totalCount, activeSet } = useRepertoire()
const { offlineCount, isOffline, saveMany, batch, batchPercent } = useOfflineScores()

const headerSubtitle = computed(() => {
  const setLabel = activeSet.value?.label ?? 'Repertorio'
  return `${setLabel} · ${totalCount.value} temas · toca uno para abrirlo`
})

const pendingDownloadCount = computed(
  () =>
    filteredScores.value.filter((score) => !score.missingPdf && !isOffline(score)).length,
)

async function onDownloadAll(): Promise<void> {
  try {
    await saveMany(filteredScores.value)
  } catch (error) {
    window.alert(error instanceof Error ? error.message : 'No se pudo completar la descarga.')
  }
}
</script>

<style scoped>
.page {
  display: grid;
  gap: 0.9rem;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: var(--ink-soft);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0 0.2rem;
}

.download-all {
  margin-left: auto;
  padding-inline: 1rem;
  font-size: 0.86rem;
}

.hint {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.84rem;
  line-height: 1.4;
}
</style>
