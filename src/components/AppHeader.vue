<template>
  <header class="header">
    <div class="header__top">
      <RouterLink to="/" class="brand-block">
        <img class="brand-logo" :src="`${baseUrl}icons/logo.png`" alt="Banda La Brutal" width="48" height="48" />
        <span class="brand-text">
          <span class="brand">Brutal</span>
          <span class="brand-sub">Repertorio</span>
        </span>
      </RouterLink>
      <ThemeToggle />
    </div>
    <p v-if="subtitle" class="header__subtitle">{{ subtitle }}</p>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

defineProps<{
  subtitle?: string
}>()

const baseUrl = import.meta.env.BASE_URL
</script>

<style scoped>
.header {
  margin-bottom: 1.1rem;
}

.header__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.brand-logo {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  object-fit: cover;
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 25%, transparent);
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.brand {
  font-size: clamp(1.7rem, 5.5vw, 2.2rem);
  line-height: 1;
}

.brand-sub {
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--ink-soft);
  font-weight: 600;
}

.header__subtitle {
  margin: 0.75rem 0 0;
  color: var(--ink-soft);
  font-size: 0.95rem;
}
</style>
