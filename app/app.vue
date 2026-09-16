<script setup lang="ts">
// Nuxt auto-importe tous les composants présents dans /components
</script>

<template>
  <main class="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-start py-8 px-4">
    <!-- Conteneur format Mobile -->
    <div class="w-full max-w-sm flex flex-col">
      
      <!-- Barre du haut avec le titre FREQUENCE et le bouton Paramètres (⚙️) -->
      <header class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-emerald-400">FREQUENCE</h1>
        </div>
        <AppSettings />
      </header>

      <!-- Écran principal des rituels et du calendrier -->
      <div class="space-y-4">
        <DayPlanner />
        <HabitCalendar />
      </div>

    </div>
  </main>
</template>