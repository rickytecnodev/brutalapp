<template>
  <div class="page rise-in">
    <AppHeader subtitle="Partituras listas para abrir sin conexión" />
    <p class="hint">
      Solo se descargan las que guardes. El resto del catálogo sigue en la red.
    </p>
    <ScoreList
      :scores="offlineScores"
      empty-message="Aún no tienes partituras guardadas offline."
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import ScoreList from '@/components/ScoreList.vue'
import { useRepertoire } from '@/composables/useRepertoire'
import { useOfflineScores } from '@/composables/useOfflineScores'

const { scores } = useRepertoire()
const { isOffline } = useOfflineScores()

const offlineScores = computed(() =>
  scores.value
    .filter((score) => isOffline(score))
    .map((score) => ({ ...score, listKey: score.id })),
)
</script>

<style scoped>
.page {
  display: grid;
  gap: 0.9rem;
}

.hint {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.92rem;
  line-height: 1.45;
}
</style>
