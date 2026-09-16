<script setup lang="ts">
// Nuxt auto-importe les composants
</script>

<template>
  <main class="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-start py-8 px-4">
    <!-- Conteneur format Mobile -->
    <div class="w-full max-w-sm flex flex-col">
      
      <!-- Barre du haut avec le titre et l'engrenage des paramètres -->
      <header class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-emerald-400">FREQUENCE</h1>
        </div>
        <AppSettings />
      </header>

      <!-- Écran principal -->
      <div class="space-y-4">
        <DayPlanner />
        <HabitCalendar />
      </div>

    </div>
  </main>
</template>