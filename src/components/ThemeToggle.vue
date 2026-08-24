<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'"
    @click="toggleTheme"
  >
    <span aria-hidden="true">{{ theme === 'dark' ? '☀' : '☾' }}</span>
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-toggle {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--bg-elevated);
  color: var(--ink);
  display: grid;
  place-items: center;
  font-size: 1.05rem;
  transition: transform 0.2s ease, background 0.2s ease;
}

.theme-toggle:hover {
  transform: rotate(-12deg);
}
</style>
