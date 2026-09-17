<script setup lang="ts">
import { useFrequenceStore } from '@/stores/frequence'

const store = useFrequenceStore()
</script>

<template>
  <div class="w-full">
    <!-- En-tête du jour -->
    <div class="flex justify-between items-center mb-5 px-1">
      <div>
        <h2 class="text-xl font-bold tracking-tight">Rituels du jour</h2>
        <p class="text-xs text-neutral-400">Ce que tu fais obligatoirement aujourd'hui</p>
      </div>
      <div class="text-xs font-mono bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full text-emerald-400 shadow-sm">
        {{ store.completedCount }} / {{ store.totalCount }}
      </div>
    </div>

    <!-- Bannière de Célébration si TOUT est validé ! -->
    <transition name="fade">
      <div 
        v-if="store.totalCount > 0 && store.completedCount === store.totalCount"
        class="mb-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-500/40 text-center shadow-lg shadow-emerald-500/10 animate-pulse"
      >
        <div class="text-2xl mb-1">🎉 🔥 🏆</div>
        <h3 class="text-sm font-bold text-emerald-300">Journée Validée avec Succès !</h3>
        <p class="text-xs text-neutral-300 mt-0.5">Tous tes rituels sont accomplis. Repose-toi bien !</p>
      </div>
    </transition>

    <!-- Liste des tâches -->
    <div class="space-y-3">
      <div 
        v-for="task in store.tasks" 
        :key="task.id"
        @click="store.toggleTask(task.id)"
        :class="[
          'flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 border select-none',
          task.completed 
            ? 'bg-emerald-950/20 border-emerald-500/30 text-neutral-400 scale-[0.99]' 
            : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 text-white shadow-lg active:scale-[0.98]'
        ]"
      >
        <div class="flex items-center gap-3.5 flex-1 pr-3">
          <!-- Icône de la tâche avec effet bounce si validée -->
          <span :class="['text-xl w-8 h-8 rounded-xl bg-neutral-800/80 flex items-center justify-center shrink-0 border border-neutral-700/50 transition-transform', task.completed ? 'scale-110 bg-emerald-500/20 border-emerald-500/40' : '']">
            {{ task.icon || '⚡' }}
          </span>
          <span :class="['text-base font-medium transition-all', task.completed ? 'line-through text-neutral-500' : '']">
            {{ task.title }}
          </span>
        </div>
        
        <!-- Checkbox visuelle avec transition douce -->
        <div :class="[
          'w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0',
          task.completed ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/30 rotate-6' : 'border-2 border-neutral-700'
        ]">
          <svg v-if="task.completed" class="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>