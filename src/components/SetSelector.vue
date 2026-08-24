<template>
  <div class="set-selector" role="tablist" aria-label="Tipo de repertorio">
    <button
      v-for="option in options"
      :key="option.id"
      type="button"
      role="tab"
      class="set-chip"
      :class="{ active: option.id === modelValue }"
      :aria-selected="option.id === modelValue"
      @click="$emit('update:modelValue', option.id)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { CatalogSetOption } from '@/types/score'

defineProps<{
  options: CatalogSetOption[]
  modelValue: string
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.set-selector {
  display: flex;
  gap: 0.45rem;
  overflow-x: auto;
  padding: 0.1rem 0.05rem 0.25rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.set-selector::-webkit-scrollbar {
  display: none;
}

.set-chip {
  flex: 0 0 auto;
  border: 1px solid var(--line);
  background: var(--bg-elevated);
  color: var(--ink-soft);
  border-radius: 999px;
  padding: 0.55rem 0.95rem;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.set-chip.active {
  background: var(--accent);
  border-color: transparent;
  color: #fffdf8;
}

[data-theme='dark'] .set-chip.active {
  color: #1a1208;
}
</style>
