<!-- components/VictoriesCheck.vue -->
<script setup lang="ts">
import { useFocusStore } from '~/stores/useFocusStore'

const store = useFocusStore()
</script>

<template>
  <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
    <h3 class="text-lg font-bold text-white mb-1">Les 5 Victoires Quotidiennes</h3>
    <p class="text-xs text-neutral-400 mb-4">Cochez vos accomplissements de la journée.</p>

    <div class="space-y-2.5">
      <div 
        v-for="v in store.victories" 
        :key="v.id"
        @click="store.toggleVictory(v.id)"
        class="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-950/40 cursor-pointer hover:border-neutral-700 transition"
      >
        <div>
          <span class="text-xs font-bold text-emerald-400 block">{{ v.label }}</span>
          <span class="text-xs text-neutral-400">{{ v.category }}</span>
        </div>
        <div 
          class="w-6 h-6 rounded-lg border flex items-center justify-center transition"
          :class="v.completed ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-neutral-700 bg-neutral-900'"
        >
          <span v-if="v.completed" class="text-xs font-bold">✓</span>
        </div>
      </div>
    </div>
  </div>
</template>