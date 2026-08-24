<template>
  <div class="list card-surface">
    <ScoreListItem
      v-for="(score, index) in scores"
      :key="score.listKey"
      :score="score"
      :index="index"
    />
    <p v-if="scores.length === 0" class="empty">{{ emptyMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import type { ScoreListItemModel } from '@/types/score'
import ScoreListItem from '@/components/ScoreListItem.vue'

withDefaults(
  defineProps<{
    scores: ScoreListItemModel[]
    emptyMessage?: string
  }>(),
  {
    emptyMessage: 'No hay partituras para mostrar.',
  },
)
</script>

<style scoped>
.list {
  overflow: hidden;
}

.empty {
  margin: 0;
  padding: 2rem 1.2rem;
  text-align: center;
  color: var(--ink-soft);
}
</style>
