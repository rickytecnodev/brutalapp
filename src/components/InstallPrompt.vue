<template>
  <div v-if="visible" class="install card-surface" role="status">
    <img class="install__logo" src="/icons/logo.png" alt="" width="40" height="40" />
    <div class="install__copy">
      <strong>Instalar Brutal</strong>
      <p v-if="isIos">En Safari: Compartir → “Añadir a pantalla de inicio”.</p>
      <p v-else>Instálala como app para abrirla más rápido y usarla offline.</p>
    </div>
    <div class="install__actions">
      <button type="button" class="btn btn-ghost" @click="dismiss">Ahora no</button>
      <button v-if="canPrompt" type="button" class="btn btn-primary" @click="install">Instalar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const STORAGE_KEY = 'brutal-install-dismissed'
const deferred = ref<BeforeInstallPromptEvent | null>(null)
const dismissed = ref(false)
const isStandalone = ref(false)
const isIos = ref(false)

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const canPrompt = computed(() => Boolean(deferred.value))
const visible = computed(
  () => !isStandalone.value && !dismissed.value && (canPrompt.value || isIos.value),
)

function dismiss(): void {
  dismissed.value = true
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // ignore
  }
}

async function install(): Promise<void> {
  if (!deferred.value) return
  await deferred.value.prompt()
  await deferred.value.userChoice
  deferred.value = null
  dismiss()
}

function onBeforeInstall(event: Event): void {
  event.preventDefault()
  deferred.value = event as BeforeInstallPromptEvent
}

onMounted(() => {
  dismissed.value = localStorage.getItem(STORAGE_KEY) === '1'
  isStandalone.value =
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  isIos.value = /iphone|ipad|ipod/i.test(navigator.userAgent)
  window.addEventListener('beforeinstallprompt', onBeforeInstall)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstall)
})
</script>

<style scoped>
.install {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.65rem 0.75rem;
  align-items: center;
  padding: 0.85rem 0.95rem;
  margin-bottom: 0.25rem;
}

.install__logo {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  object-fit: cover;
}

.install__copy strong {
  display: block;
  font-size: 0.95rem;
}

.install__copy p {
  margin: 0.2rem 0 0;
  color: var(--ink-soft);
  font-size: 0.82rem;
  line-height: 1.35;
}

.install__actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 0.45rem;
}

@media (min-width: 560px) {
  .install {
    grid-template-columns: auto 1fr auto;
  }

  .install__actions {
    grid-column: auto;
  }
}
</style>
