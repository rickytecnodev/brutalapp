<template>
  <Teleport to="body">
    <Transition name="progress-slide">
      <div v-if="batch.active || showDoneFlash" class="panel" role="status" aria-live="polite">
        <div class="panel__top">
          <div class="panel__copy">
            <strong>{{ headline }}</strong>
            <p v-if="batch.active">{{ batch.currentTitle }}</p>
            <p v-else-if="batch.errors">Terminó con {{ batch.errors }} error(es).</p>
            <p v-else>Listo para usar sin conexión.</p>
          </div>
          <button
            v-if="batch.active"
            type="button"
            class="btn btn-ghost cancel"
            @click="cancelBatch"
          >
            Detener
          </button>
        </div>

        <div class="track" aria-hidden="true">
          <div class="fill" :style="{ width: `${displayPercent}%` }" />
        </div>

        <div class="panel__meta">
          <span class="percent">{{ displayPercent }}%</span>
          <span v-if="batch.active || batch.total">
            {{ Math.min(batch.index + 1, batch.total) }} / {{ batch.total }}
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useOfflineScores } from '@/composables/useOfflineScores'

const { batch, batchPercent, cancelBatch } = useOfflineScores()
const showDoneFlash = ref(false)

const displayPercent = computed(() => {
  if (batch.value.active) return batchPercent.value
  return showDoneFlash.value ? 100 : 0
})

const headline = computed(() => {
  if (batch.value.active) return 'Descargando partituras'
  if (batch.value.errors) return 'Descarga terminada'
  return 'Descarga completa'
})

watch(
  () => batch.value.active,
  (active, wasActive) => {
    if (wasActive && !active) {
      showDoneFlash.value = true
      window.setTimeout(() => {
        showDoneFlash.value = false
      }, 1800)
    }
  },
)
</script>

<style scoped>
.panel {
  position: fixed;
  left: 50%;
  bottom: calc(4.6rem + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  width: min(920px, calc(100% - 1.2rem));
  z-index: 60;
  padding: 0.9rem 1rem;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg-elevated) 92%, transparent);
  box-shadow: var(--shadow);
  backdrop-filter: blur(14px);
}

.panel__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.panel__copy strong {
  display: block;
  font-size: 0.95rem;
}

.panel__copy p {
  margin: 0.2rem 0 0;
  color: var(--ink-soft);
  font-size: 0.82rem;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70vw;
}

.cancel {
  flex-shrink: 0;
  padding: 0.4rem 0.75rem;
  font-size: 0.78rem;
}

.track {
  margin-top: 0.75rem;
  height: 0.55rem;
  border-radius: 999px;
  background: var(--bg-muted);
  overflow: hidden;
}

.fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--teal), var(--accent));
  transition: width 0.2s ease;
}

.panel__meta {
  margin-top: 0.45rem;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ink-soft);
}

.percent {
  color: var(--accent-deep);
  font-variant-numeric: tabular-nums;
}

[data-theme='dark'] .percent {
  color: var(--accent);
}

.progress-slide-enter-active,
.progress-slide-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.progress-slide-enter-from,
.progress-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>
