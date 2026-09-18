<script setup lang="ts">
import { spawnRipple } from '~/utils/ripple'
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-start py-8 px-4" style="background: var(--bg); color: var(--on-surface);">
    <div class="w-full max-w-sm flex flex-col">

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
            style="background: var(--violet-container); color: var(--violet);"
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