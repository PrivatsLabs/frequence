<!-- app/components/TaskPreview.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useFocusStore } from '~/stores/useFocusStore'

const store = useFocusStore()

// Tâche précédente (ou manquée)
const previousTask = computed(() => {
  if (store.activeTaskIndex > 0) {
    return store.tasks[store.activeTaskIndex - 1]
  }
  return null
})

// Tâche en cours
const currentTask = computed(() => {
  return store.tasks[store.activeTaskIndex] || null
})

// Tâche suivante
const nextTask = computed(() => {
  if (store.activeTaskIndex < store.tasks.length - 1) {
    return store.tasks[store.activeTaskIndex + 1]
  }
  return null
})

const nextTaskIndex = () => {
  if (store.activeTaskIndex < store.tasks.length - 1) {
    store.setActiveTask(store.activeTaskIndex + 1)
  }
}

const prevTaskIndex = () => {
  if (store.activeTaskIndex > 0) {
    store.setActiveTask(store.activeTaskIndex - 1)
  }
}
</script>

<template>
  <div class="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 space-y-4 backdrop-blur">
    <div class="flex justify-between items-center text-xs font-mono tracking-widest text-neutral-400 uppercase">
      <span>Séquence des Tâches</span>
      <span v-if="store.tasks.length > 0">
        {{ store.activeTaskIndex + 1 }} / {{ store.tasks.length }}
      </span>
    </div>

    <!-- Aperçu dynamique : Précédent / En Cours / Suivant -->
    <div class="space-y-2">
      <!-- Tâche Précédente (Ratée / Passée) -->
      <div 
        v-if="previousTask" 
        @click="prevTaskIndex"
        class="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/40 border border-neutral-800/40 text-xs text-neutral-500 line-through opacity-60 cursor-pointer hover:opacity-80 transition-all"
      >
        <div class="flex items-center gap-2 truncate">
          <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">Précédente</span>
          <span class="truncate">{{ previousTask.title }}</span>
        </div>
        <span class="font-mono text-[10px]" v-if="previousTask.time">{{ previousTask.time }}</span>
      </div>

      <!-- Tâche en Cours (Focus Principal) -->
      <div 
        v-if="currentTask" 
        class="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 font-medium shadow-lg shadow-emerald-950/20"
      >
        <div class="flex items-center gap-2.5 truncate">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span class="truncate text-sm font-semibold text-white">{{ currentTask.title }}</span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-xs font-mono text-emerald-400/80 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/30" v-if="currentTask.time">
            {{ currentTask.time }}
          </span>
          <button 
            @click="store.toggleTask(currentTask.id)" 
            class="text-xs px-2.5 py-1 rounded-md font-mono transition-colors"
            :class="currentTask.completed ? 'bg-emerald-500 text-black font-bold' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'"
          >
            {{ currentTask.completed ? '✓ Fait' : 'Valider' }}
          </button>
        </div>
      </div>

      <!-- Tâche Suivante (Preview Subtile) -->
      <div 
        v-if="nextTask" 
        @click="nextTaskIndex"
        class="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/30 border border-dashed border-neutral-800/60 text-xs text-neutral-400 opacity-70 hover:opacity-100 hover:border-neutral-700 cursor-pointer transition-all"
      >
        <div class="flex items-center gap-2 truncate">
          <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400">Suivante</span>
          <span class="truncate">{{ nextTask.title }}</span>
        </div>
        <span class="font-mono text-[10px] text-neutral-500" v-if="nextTask.time">{{ nextTask.time }}</span>
      </div>
    </div>
  </div>
</template>