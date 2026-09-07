<!-- components/DayPlanner.vue -->
<script setup lang="ts">
import { useFocusStore } from '~/stores/useFocusStore'
const store = useFocusStore()
</script>

<template>
  <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
    <h3 class="text-lg font-bold text-white mb-4 flex items-center justify-between">
      <span>Planning de la Journée</span>
      <span class="text-xs font-mono text-neutral-400">{{ store.tasks.filter(t => t.completed).length }}/{{ store.tasks.length }} Fait</span>
    </h3>

    <div class="space-y-3">
      <div 
        v-for="(task, index) in store.tasks" 
        :key="task.id"
        @click="store.setActiveTask(index)"
        class="p-4 rounded-xl border transition cursor-pointer flex items-center justify-between gap-4"
        :class="[
          store.activeTaskIndex === index 
            ? 'bg-neutral-800 border-emerald-500/50 shadow-lg' 
            : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
        ]"
      >
        <div class="flex items-center gap-4">
          <input 
            type="checkbox" 
            :checked="task.completed" 
            @click.stop="store.toggleTask(task.id)"
            class="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
          />
          <div>
            <div class="text-xs font-mono text-neutral-500">{{ task.time }}</div>
            <div class="text-sm font-semibold text-neutral-200" :class="{ 'line-through text-neutral-500': task.completed }">
              {{ task.title }}
            </div>
          </div>
        </div>

        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border bg-neutral-900 border-neutral-700 text-neutral-400">
          {{ task.category }}
        </span>
      </div>
    </div>
  </div>
</template>