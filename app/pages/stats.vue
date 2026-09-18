<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFrequenceStore } from '@/stores/frequence'
import { spawnRipple } from '~/utils/ripple'

const store = useFrequenceStore()

const COLORS = ['#ff8a3d', '#9089fc', '#ffd166', '#ff5d8f', '#4dd4ac', '#5eb1ff']

const RANGE_OPTIONS = [
  { label: '7j', value: 7 },
  { label: '30j', value: 30 },
  { label: '90j', value: 90 },
  { label: 'Tout', value: 'all' as const },
]
const selectedRange = ref<number | 'all'>(30)
const selectedIndex = computed(() => RANGE_OPTIONS.findIndex(o => o.value === selectedRange.value))

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: store.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

const rangeDays = computed(() => {
  if (selectedRange.value !== 'all') return selectedRange.value
  const dates = Object.keys(store.taskLog)
  if (dates.length === 0) return 30
  const todayStr = formatDate(new Date())
  const earliest = dates.sort()[0]
  const diffDays = Math.round((new Date(todayStr).getTime() - new Date(earliest).getTime()) / 86400000) + 1
  return Math.max(diffDays, 7)
})

const timelineDays = computed(() => {
  const days: string[] = []
  for (let i = rangeDays.value - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(formatDate(d))
  }
  return days
})

const series = computed(() => store.tasks.map((t, idx) => {
  let cumulative = 0
  const points = timelineDays.value.map(day => {
    if ((store.taskLog[day] || []).includes(t.id)) cumulative++
    return cumulative
  })
  return { id: t.id, title: t.title, icon: t.icon || '⚡', color: COLORS[idx % COLORS.length], points, total: cumulative }
}))

const rankedSeries = computed(() => [...series.value].sort((a, b) => b.total - a.total))
const maxValue = computed(() => Math.max(1, ...series.value.flatMap(s => s.points)))

const W = 600, H = 200, padL = 10, padR = 10, padT = 15, padB = 15
const plotW = W - padL - padR, plotH = H - padT - padB

function xPos(i: number) {
  const len = timelineDays.value.length
  return len <= 1 ? padL : padL + (i / (len - 1)) * plotW
}
function yPos(v: number) { return padT + plotH - (v / maxValue.value) * plotH }

const linePaths = computed(() => series.value.map(s => ({
  id: s.id, color: s.color, d: s.points.map((p, i) => `${xPos(i)},${yPos(p)}`).join(' ')
})))

const xLabels = computed(() => {
  const days = timelineDays.value
  const idxs = [...new Set([0, Math.floor((days.length - 1) / 2), days.length - 1])]
  const fmt = new Intl.DateTimeFormat('fr-FR', { timeZone: store.timezone, day: 'numeric', month: 'short' })
  return idxs.map(i => ({ x: xPos(i), label: fmt.format(new Date(days[i])) }))
})

const gridLines = [0, 0.25, 0.5, 0.75, 1]
</script>

<template>
  <div class="space-y-5">
    <NuxtLink to="/" class="text-sm" style="color: var(--on-surface-dim);">← Retour</NuxtLink>

    <div>
      <h2 class="text-xl font-bold tracking-tight" style="font-family: var(--font-display);">Comparaison des rituels</h2>
      <p class="text-xs" style="color: var(--on-surface-dim);">Évolution cumulée sur la période sélectionnée</p>
    </div>

    <!-- Segmented control avec curseur animé -->
    <div class="relative flex p-1 rounded-2xl w-fit" style="background: var(--surface-high);">
      <div
        class="absolute top-1 bottom-1 rounded-xl"
        :style="{
          width: `calc(${100 / RANGE_OPTIONS.length}% - 4px)`,
          left: `calc(${selectedIndex * (100 / RANGE_OPTIONS.length)}% + 2px)`,
          background: 'var(--ember)',
          transition: 'left 340ms var(--ease-spring)'
        }"
      />
      <button
        v-for="opt in RANGE_OPTIONS" :key="opt.value"
        @click="(e) => { spawnRipple(e); selectedRange = opt.value }"
        class="relative z-10 ripple-container px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
        :style="{ color: selectedRange === opt.value ? '#15120f' : 'var(--on-surface-dim)' }"
      >
        {{ opt.label }}
      </button>
    </div>

    <div v-if="store.tasks.length === 0" class="text-sm text-center py-8" style="color: var(--on-surface-faint);">
      Ajoute des rituels pour voir apparaître le graphique.
    </div>

    <template v-else>
      <div class="p-4 rounded-[28px]" style="background: var(--surface); border: 1px solid var(--surface-hairline);">
        <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto overflow-visible">
          <line v-for="g in gridLines" :key="g" :x1="padL" :x2="W - padR" :y1="padT + plotH - g * plotH" :y2="padT + plotH - g * plotH" stroke="var(--surface-hairline)" stroke-width="1" />
          <polyline v-for="line in linePaths" :key="line.id" :points="line.d" fill="none" :stroke="line.color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          <circle v-for="s in series" :key="'dot-' + s.id" :cx="xPos(s.points.length - 1)" :cy="yPos(s.total)" r="3.5" :fill="s.color" />
          <text v-for="l in xLabels" :key="l.label" :x="l.x" :y="H - 2" font-size="9" fill="var(--on-surface-faint)" text-anchor="middle">{{ l.label }}</text>
        </svg>
      </div>

      <div class="space-y-2">
        <div
          v-for="(s, idx) in rankedSeries" :key="s.id"
          class="flex items-center justify-between px-3.5 py-2.5 rounded-2xl"
          style="background: var(--surface); border: 1px solid var(--surface-hairline);"
        >
          <div class="flex items-center gap-2.5 text-sm">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: s.color }" />
            <span class="font-mono text-xs" style="color: var(--on-surface-faint);">#{{ idx + 1 }}</span>
            <span>{{ s.icon }}</span>
            <span class="font-medium">{{ s.title }}</span>
          </div>
          <span class="text-xs font-mono" :style="{ color: s.color }">{{ s.total }}x</span>
        </div>
      </div>
    </template>
  </div>
</template>