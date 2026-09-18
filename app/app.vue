<script setup lang="ts">
// Nuxt auto-importe tous les composants présents dans /components
</script>

<template>
  <main class="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-start py-8 px-4">
    <div class="w-full max-w-sm flex flex-col">
      
      <header class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-emerald-400">FREQUENCE</h1>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink 
            to="/stats"
            class="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-md active:scale-95"
            title="Statistiques"
          >
            📊
          </NuxtLink>
          <AppSettings />
        </div>
      </header>

      <!-- Le contenu change selon la page grâce à NuxtPage -->
      <NuxtPage />

    </div>
  </main>
</template>