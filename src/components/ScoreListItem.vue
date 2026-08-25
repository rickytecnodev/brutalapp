<template>
  <article class="item rise-in" :style="{ animationDelay: `${Math.min(index, 12) * 30}ms` }">
    <button type="button" class="item__main" @click="openScore(score)">
      <div class="item__meta">
        <h2>{{ score.title }}</h2>
        <p>{{ score.composer }}</p>
        <p v-if="score.missingPdf" class="tono">Tono: {{ tono }}</p>
        <div v-if="progress !== null" class="item__progress" aria-hidden="true">
          <div class="item__progress-fill" :style="{ width: `${progress}%` }" />
        </div>
      </div>
    </button>

    <div class="item__side">
      <span
        v-if="score.missingPdf"
        class="pdf-miss"
        title="PDF no disponible"
        aria-label="PDF no disponible"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm1 7V3.5L19.5 9H15zM8.5 18l1.2-3.2h.1L11 18h1.4l-1.8-4.2L12.5 10H11l-1.1 3.1h-.1L8.7 10H7.2L9 13.8 7.2 18h1.3zm5.2 0h3.6v-1.1h-2.3v-1.2h2.1v-1.1h-2.1V12h2.3V10.9h-3.6V18z"
          />
          <path
            fill="currentColor"
            d="M4.2 5.6 18.4 19.8l1.1-1.1L5.3 4.5 4.2 5.6z"
          />
        </svg>
      </span>
      <span v-else-if="progress !== null" class="downloading">{{ progress }}%</span>
      <OfflineBadge v-else-if="isOffline(score)" :offline="true" />

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
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ScoreListItemModel } from '@/types/score'
import { scoreTono } from '@/types/score'
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
const tono = computed(() => scoreTono(props.score))

const actionLabel = computed(() => {
  if (progress.value !== null) return `${progress.value}%`
  if (isBusy(props.score.id)) return '…'
  if (isOffline(props.score)) return 'Eliminar'
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
  display: block;
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
}

.item__side {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  flex-shrink: 0;
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

.pdf-miss {
  display: grid;
  place-items: center;
  width: 1.7rem;
  height: 1.7rem;
  color: var(--danger);
  opacity: 0.9;
}

.downloading {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.28rem 0.45rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.tono {
  margin: 0.3rem 0 0;
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
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
