<template>
  <div class="app-shell">
    <main class="app-main">
      <RouterView />
    </main>
    <ScoreViewerHost />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import ScoreViewerHost from '@/components/ScoreViewerHost.vue'
import { useTheme } from '@/composables/useTheme'
import { useOfflineScores } from '@/composables/useOfflineScores'

useTheme()
useOfflineScores()
</script>
