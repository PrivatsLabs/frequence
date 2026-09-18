<script setup lang="ts">
import { onMounted } from 'vue'
import { useFrequenceStore } from '@/stores/frequence'
import { spawnRipple } from '~/utils/ripple'

const store = useFrequenceStore()

onMounted(() => {
  store.initAuth()
})
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-start py-8 px-4" style="background: var(--bg); color: var(--on-surface);">

    <div v-if="store.authLoading" class="min-h-screen flex items-center justify-center">
      <span class="text-sm" style="color: var(--on-surface-dim);">Chargement...</span>
    </div>

    <AuthScreen v-else-if="!store.userId" />

    <div v-else class="w-full max-w-sm flex flex-col">
      <header class="flex justify-between items-center mb-7">
        <h1
          class="text-3xl font-extrabold tracking-tight"
          style="font-family: var(--font-display); background: linear-gradient(135deg, var(--ember), #ffb673); -webkit-background-clip: text; background-clip: text; color: transparent;"
        >
          FREQUENCE
        </h1>
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/stats"
            @click="spawnRipple"
            class="ripple-container flex items-center justify-center w-11 h-11 rounded-2xl transition-transform active:scale-90"
            style="background: var(--surface); color: var(--ember); box-shadow: var(--shadow-card);"
            title="Statistiques"
          >
            📊
          </NuxtLink>
          <AppSettings />
        </div>
      </header>

      <NuxtPage />
    </div>

  </main>
</template>