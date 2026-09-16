<script setup lang="ts">
import { computed } from 'vue'
import { useFrequenceStore } from '@/stores/frequence'

const store = useFrequenceStore()

const recentDays = computed(() => {
  const days = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    
    // Génération de la date exacte basée sur le timezone du store
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: store.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    const dateStr = formatter.format(d)

    // Formatage du libellé (ex: L 15)
    const labelFormatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: store.timezone,
      weekday: 'narrow',
      day: 'numeric'
    })

    const count = store.history[dateStr] || 0
    
    days.push({
      date: dateStr,
      label: labelFormatter.format(d),
      count
    })
  }
  return days
})
</script>

<template>
  <div class="w-full mt-6 bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800/80">
    <h3 class="text-sm font-semibold mb-3 text-neutral-300">Suivi de régularité</h3>
    
    <div class="grid grid-cols-7 gap-2">
      <div 
        v-for="day in recentDays" 
        :key="day.date"
        class="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-neutral-900 border border-neutral-800/50"
      >
        <span class="text-[10px] text-neutral-400 font-mono uppercase">{{ day.label }}</span>
        
        <div :class="[
          'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all',
          day.count > 0 && day.count === store.totalCount ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20' :
          day.count > 0 ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 
          'bg-neutral-800/50 text-neutral-600'
        ]">
          {{ day.count }}
        </div>
      </div>
    </div>
  </div>
</template>