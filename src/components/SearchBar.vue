<template>
  <label class="search">
    <span class="sr-only">Buscar partituras</span>
    <span class="search__ico" aria-hidden="true">⌕</span>
    <input
      :value="modelValue"
      type="search"
      enterkeyhint="search"
      autocomplete="off"
      placeholder="Buscar por nombre o compositor…"
      @input="onInput"
    />
    <button
      v-if="modelValue"
      type="button"
      class="search__clear"
      aria-label="Limpiar búsqueda"
      @click="$emit('update:modelValue', '')"
    >
      ×
    </button>
  </label>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.search {
  position: relative;
  display: block;
}

.search__ico {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-soft);
  pointer-events: none;
}

input {
  width: 100%;
  border: 1px solid var(--line);
  background: var(--bg-elevated);
  color: var(--ink);
  border-radius: 999px;
  padding: 0.85rem 2.5rem 0.85rem 2.35rem;
  outline: none;
}

input:focus {
  border-color: color-mix(in srgb, var(--accent) 55%, var(--line));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}

.search__clear {
  position: absolute;
  right: 0.45rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 999px;
  background: var(--bg-muted);
  color: var(--ink-soft);
}
</style>
