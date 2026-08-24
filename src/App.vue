<template>
  <div class="app-shell">
    <main class="app-main">
      <RouterView />
    </main>
    <BottomNav />
    <ScoreViewerHost />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import ScoreViewerHost from '@/components/ScoreViewerHost.vue'
import { useTheme } from '@/composables/useTheme'
import { useOfflineScores } from '@/composables/useOfflineScores'

useTheme()
useOfflineScores()
</script>
