<template>
  <Teleport to="body">
    <div v-if="open && loading" class="boot" role="status">
      <div class="spinner" aria-hidden="true" />
      <p>Cargando partitura…</p>
    </div>
    <div v-else-if="open && error" class="boot boot--error" role="alertdialog">
      <div v-if="unavailableTone" class="tone-card">
        <span class="tone-card__label">Tonalidad</span>
        <strong class="tone-card__value">{{ unavailableTone }}</strong>
      </div>
      <p>{{ error }}</p>
      <div class="boot__actions">
        <button type="button" class="btn btn-ghost" @click="close">Cerrar</button>
        <button
          v-if="!unavailableTone"
          type="button"
          class="btn btn-primary"
          @click="retry"
        >
          Reintentar
        </button>
      </div>
    </div>
  </Teleport>

  <PdfViewer
    :open="open && Boolean(src) && !loading && !error"
    :src="src"
    :title="selected?.title"
    :composer="selected?.composer"
    @close="close"
    @retry="retry"
  />
</template>

<script setup lang="ts">
import PdfViewer from '@/components/PdfViewer.vue'
import { useScoreViewer } from '@/composables/useScoreViewer'

const { selected, open, src, loading, error, unavailableTone, retry, close } = useScoreViewer()
</script>

<style scoped>
.boot {
  position: fixed;
  inset: 0;
  z-index: 85;
  display: grid;
  place-content: center;
  gap: 0.85rem;
  background: rgba(12, 10, 9, 0.88);
  color: #f5f0e8;
  text-align: center;
  padding: 1.5rem;
}

.boot--error {
  gap: 1rem;
}

.boot__actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.tone-card {
  justify-self: center;
  min-width: 11rem;
  padding: 0.85rem 1.2rem;
  border-radius: 14px;
  border: 1px solid rgba(251, 146, 60, 0.35);
  background: rgba(251, 146, 60, 0.12);
}

.tone-card__label {
  display: block;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #fdba74;
  margin-bottom: 0.25rem;
}

.tone-card__value {
  font-family: Georgia, 'Iowan Old Style', Palatino, serif;
  font-size: 1.45rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  margin: 0 auto;
  border-radius: 999px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fb923c;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
