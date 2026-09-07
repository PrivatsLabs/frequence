<!-- app/pages/index.vue -->
<template>
  <div class="space-y-8 max-w-2xl mx-auto">
    <!-- Mission du moment en grand -->
    <CurrentMission />

    <!-- Aperçu de la séquence de tâches (Précédente / Active / Suivante) -->
    <TaskPreview />

    <!-- Minuteur central -->
    <FocusTimer />
    
    <!-- Suivi des victoires -->
    <VictoriesCheck />
  </div>
</template>