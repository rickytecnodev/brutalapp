<template>
  <nav class="bottom-nav" aria-label="Navegación principal">
    <RouterLink class="nav-item" to="/" :class="{ active: route.name === 'repertoire' }">
      <span class="nav-ico" aria-hidden="true">♪</span>
      <span>Repertorio</span>
    </RouterLink>
    <RouterLink class="nav-item" to="/offline" :class="{ active: route.name === 'offline' }">
      <span class="nav-ico" aria-hidden="true">⬇</span>
      <span>Offline</span>
      <span v-if="offlineCount > 0" class="badge">{{ offlineCount }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { useOfflineScores } from '@/composables/useOfflineScores'

const route = useRoute()
const { offlineCount } = useOfflineScores()
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(920px, 100%);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  padding: 0.55rem 0.75rem calc(0.55rem + env(safe-area-inset-bottom, 0px));
  background: color-mix(in srgb, var(--bg-elevated) 88%, transparent);
  border-top: 1px solid var(--line);
  backdrop-filter: blur(14px);
  z-index: 40;
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.45rem 0.5rem;
  border-radius: 12px;
  color: var(--ink-soft);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.nav-item.active {
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}

.nav-ico {
  font-size: 1.05rem;
  line-height: 1;
}

.badge {
  position: absolute;
  top: 0.2rem;
  right: calc(50% - 2.2rem);
  min-width: 1.2rem;
  height: 1.2rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-size: 0.68rem;
  display: grid;
  place-items: center;
}

[data-theme='dark'] .badge {
  color: #1a1208;
}
</style>
