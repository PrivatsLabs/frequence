<script setup lang="ts">
import { computed } from 'vue'
import { useFrequenceStore } from '@/stores/frequence'

const store = useFrequenceStore()

function safeCount(raw: unknown): number {
  return typeof raw === 'number' ? raw : 0
}

const recentDays = computed(() => {
  const days = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)

    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: store.timezone, year: 'numeric', month: '2-digit', day: '2-digit'
    })
    const dateStr = formatter.format(d)

    const labelFormatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: store.timezone, weekday: 'narrow', day: 'numeric'
    })

    const count = safeCount(store.history[dateStr])
    const ratio = store.totalCount > 0 ? Math.min(count / store.totalCount, 1) : 0
    const isToday = dateStr === store.todayKey
    const isViewed = dateStr === store.viewingDateEffective

    days.push({ date: dateStr, label: labelFormatter.format(d), count, ratio, isToday, isViewed })
  }
  return days
})
</script>

<template>
  <div class="w-full mt-6 p-5 rounded-[28px]" style="background: var(--surface); box-shadow: var(--shadow-card);">
    <h3 class="text-sm font-semibold mb-1" style="color: var(--on-surface-dim);">Suivi de régularité</h3>
    <p class="text-xs mb-4" style="color: var(--on-surface-faint);">Touche un jour pour revoir ou corriger tes rituels</p>

    <div class="grid grid-cols-7 gap-2">
      <button
        v-for="day in recentDays" :key="day.date"
        @click="store.setViewingDate(day.date)"
        class="flex flex-col items-center gap-1.5"
      >
        <span
          class="text-[10px] font-mono"
          :style="{ color: day.isToday ? 'var(--ember)' : 'var(--on-surface-faint)', fontWeight: day.isToday ? 700 : 400 }"
        >{{ day.label }}</span>

        <div
          class="w-8 h-8 rounded-[14px] flex items-center justify-center font-bold text-[11px]"
          :style="{
            background: day.ratio > 0
              ? `color-mix(in srgb, var(--ember) ${Math.round(day.ratio * 100)}%, var(--surface-high))`
              : 'var(--surface-high)',
            color: day.ratio > 0.5 ? '#fff' : 'var(--on-surface-dim)',
            boxShadow: day.isViewed
              ? '0 0 0 2px var(--violet)'
              : (day.ratio === 1 ? '0 0 0 2px var(--ember)' : 'none'),
            transition: 'all 320ms var(--ease-standard)'
          }"
        >
          {{ day.count }}
        </div>
      </button>
    </div>
  </div>
</template>