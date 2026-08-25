<template>
  <article class="item rise-in" :style="{ animationDelay: `${Math.min(index, 12) * 30}ms` }">
    <button type="button" class="item__main" @click="openScore(score)">
      <div class="item__meta">
        <h2>{{ score.title }}</h2>
        <p>{{ score.composer }}</p>
        <div v-if="progress !== null" class="item__progress" aria-hidden="true">
          <div class="item__progress-fill" :style="{ width: `${progress}%` }" />
        </div>
      </div>
      <div class="item__badges">
        <span v-if="score.missingPdf" class="pending">Sin PDF</span>
        <span v-else-if="progress !== null" class="downloading">{{ progress }}%</span>
        <OfflineBadge v-else :offline="isOffline(score)" />
      </div>
    </button>
    <button
      type="button"
      class="btn item__action"
      :class="isOffline(score) ? 'btn-danger' : 'btn-ghost'"
      :disabled="isBusy(score.id) || score.missingPdf || (batch.active && !isOffline(score))"
      :aria-label="isOffline(score) ? 'Eliminar de offline' : 'Guardar para offline'"
      @click.stop="onToggle"
    >
      {{ actionLabel }}
    </button>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ScoreListItemModel } from '@/types/score'
import OfflineBadge from '@/components/OfflineBadge.vue'
import { useOfflineScores } from '@/composables/useOfflineScores'
import { useScoreViewer } from '@/composables/useScoreViewer'

const props = withDefaults(
  defineProps<{
    score: ScoreListItemModel
    index?: number
  }>(),
  { index: 0 },
)

const { isOffline, isBusy, getProgress, toggle, batch } = useOfflineScores()
const { openScore } = useScoreViewer()

const progress = computed(() => getProgress(props.score.id))

const actionLabel = computed(() => {
  if (progress.value !== null) return `${progress.value}%`
  if (isBusy(props.score.id)) return '…'
  if (isOffline(props.score)) return 'Quitar'
  if (batch.value.active) return 'Espera'
  return 'Guardar'
})

async function onToggle(): Promise<void> {
  try {
    await toggle(props.score)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar el estado offline.'
    window.alert(message)
  }
}
</script>

<style scoped>
.item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.65rem;
  align-items: center;
  padding: 0.85rem 0.9rem;
  border-bottom: 1px solid var(--line);
}

.item:last-child {
  border-bottom: 0;
}

.item__main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  padding: 0;
  cursor: pointer;
}

.item__main:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent) 70%, transparent);
  outline-offset: 3px;
  border-radius: 8px;
}

.item__meta {
  min-width: 0;
  flex: 1;
}

.item__progress {
  margin-top: 0.45rem;
  height: 0.35rem;
  border-radius: 999px;
  background: var(--bg-muted);
  overflow: hidden;
}

.item__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), var(--accent-soft));
  transition: width 0.15s ease;
}

.item__badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
  flex-shrink: 0;
}

.pending,
.downloading {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
}

.pending {
  background: color-mix(in srgb, var(--accent) 16%, var(--bg-muted));
  color: var(--accent);
}

.downloading {
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

h2 {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

p {
  margin: 0.25rem 0 0;
  color: var(--ink-soft);
  font-size: 0.88rem;
}

.item__action {
  min-width: 5.4rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.82rem;
}
</style>
