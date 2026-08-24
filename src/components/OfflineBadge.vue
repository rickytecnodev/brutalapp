<template>
  <span class="badge" :class="offline ? 'badge--ok' : 'badge--muted'">
    <span class="dot" aria-hidden="true" />
    {{ offline ? 'Offline' : 'En línea' }}
  </span>
</template>

<script setup lang="ts">
defineProps<{ offline: boolean }>()
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
}

.badge--ok {
  background: var(--ok-bg);
  color: var(--ok);
}

.badge--muted {
  background: var(--bg-muted);
  color: var(--ink-soft);
}

.dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: currentColor;
}
</style>
