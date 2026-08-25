<template>
  <span
    class="dot"
    :class="offline ? 'dot--ok' : 'dot--off'"
    :title="offline ? 'Disponible offline' : 'Solo en línea'"
    :aria-label="offline ? 'Disponible offline' : 'Solo en línea'"
  />
</template>

<script setup lang="ts">
defineProps<{ offline: boolean }>()
</script>

<style scoped>
.dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  flex-shrink: 0;
  display: inline-block;
}

.dot--ok {
  background: var(--ok);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ok) 22%, transparent);
}

.dot--off {
  background: color-mix(in srgb, var(--ink-soft) 45%, transparent);
}
</style>
