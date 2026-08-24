<template>
  <Teleport to="body">
    <div v-if="open && loading" class="boot" role="status">
      <div class="spinner" aria-hidden="true" />
      <p>Cargando partitura…</p>
    </div>
    <div v-else-if="open && error" class="boot boot--error" role="alertdialog">
      <p>{{ error }}</p>
      <div class="boot__actions">
        <button type="button" class="btn btn-ghost" @click="close">Cerrar</button>
        <button type="button" class="btn btn-primary" @click="retry">Reintentar</button>
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

const { selected, open, src, loading, error, retry, close } = useScoreViewer()
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
