<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFrequenceStore } from '@/stores/frequence'

const store = useFrequenceStore()

const COLORS = ['#34d399', '#38bdf8', '#f472b6', '#fbbf24', '#a78bfa', '#fb7185', '#4ade80', '#f97316']

const RANGE_OPTIONS = [
  { label: '7 jours', value: 7 },
  { label: '30 jours', value: 30 },
  { label: '90 jours', value: 90 },
  { label: 'Depuis le début', value: 'all' as const },
]

const selectedRange = ref<number | 'all'>(30)

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: store.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d)
}

// Nombre de jours à afficher selon la sélection
const rangeDays = computed(() => {
  if (selectedRange.value !== 'all') return selectedRange.value

  const dates = Object.keys(store.taskLog)
  if (dates.length === 0) return 30

  const todayStr = formatDate(new Date())
  const earliest = dates.sort()[0]
  const diffMs = new Date(todayStr).getTime() - new Date(earliest).getTime()
  const diffDays = Math.round(diffMs / 86400000) + 1
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

// Pour chaque tâche : une courbe cumulative sur la période choisie
const series = computed(() => {
  return store.tasks.map((t, idx) => {
    let cumulative = 0
    const points = timelineDays.value.map(day => {
      if ((store.taskLog[day] || []).includes(t.id)) cumulative++
      return cumulative
    })
    return {
      id: t.id,
      title: t.title,
      icon: t.icon || '⚡',
      color: COLORS[idx % COLORS.length],
      points,
      total: cumulative
    }
  })
})

const rankedSeries = computed(() => [...series.value].sort((a, b) => b.total - a.total))

const maxValue = computed(() => Math.max(1, ...series.value.flatMap(s => s.points)))

// Géométrie du SVG
const W = 600, H = 200
const padL = 10, padR = 10, padT = 15, padB = 15
const plotW = W - padL - padR
const plotH = H - padT - padB

function xPos(i: number) {
  const len = timelineDays.value.length
  return len <= 1 ? padL : padL + (i / (len - 1)) * plotW
}
function yPos(v: number) {
  return padT + plotH - (v / maxValue.value) * plotH
}

const linePaths = computed(() => {
  return series.value.map(s => ({
    id: s.id,
    color: s.color,
    d: s.points.map((p, i) => `${xPos(i)},${yPos(p)}`).join(' ')
  }))
})

const xLabels = computed(() => {
  const days = timelineDays.value
  const idxs = [0, Math.floor((days.length - 1) / 2), days.length - 1]
  const fmt = new Intl.DateTimeFormat('fr-FR', { timeZone: store.timezone, day: 'numeric', month: 'short' })
  return [...new Set(idxs)].map(i => ({ x: xPos(i), label: fmt.format(new Date(days[i])) }))
})

const gridLines = [0, 0.25, 0.5, 0.75, 1]
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center gap-3 mb-1">
      <NuxtLink to="/" class="text-neutral-400 hover:text-white text-sm">← Retour</NuxtLink>
    </div>

    <div>
      <h2 class="text-xl font-bold tracking-tight">Comparaison des rituels</h2>
      <p class="text-xs text-neutral-400">Évolution cumulée sur la période sélectionnée</p>
    </div>

    <!-- Sélecteur de période -->
    <div class="flex gap-1.5 bg-neutral-900/60 p-1 rounded-xl border border-neutral-800/80 w-fit">
      <button
        v-for="opt in RANGE_OPTIONS"
        :key="opt.value"
        @click="selectedRange = opt.value"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
          selectedRange === opt.value
            ? 'bg-emerald-500 text-neutral-950'
            : 'text-neutral-400 hover:text-white'
        ]"
      >
        {{ opt.label }}
      </button>
    </div>

    <div v-if="store.tasks.length === 0" class="text-sm text-neutral-500 text-center py-8">
      Ajoute des rituels pour voir apparaître le graphique.
    </div>

    <template v-else>
      <!-- Graphique -->
      <div class="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800/80">
        <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto overflow-visible">
          <line
            v-for="g in gridLines"
            :key="g"
            :x1="padL" :x2="W - padR"
            :y1="padT + plotH - g * plotH" :y2="padT + plotH - g * plotH"
            stroke="#27272a" stroke-width="1"
          />

          <polyline
            v-for="line in linePaths"
            :key="line.id"
            :points="line.d"
            fill="none"
            :stroke="line.color"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <circle
            v-for="s in series"
            :key="'dot-' + s.id"
            :cx="xPos(s.points.length - 1)"
            :cy="yPos(s.total)"
            r="3.5"
            :fill="s.color"
          />

          <text
            v-for="l in xLabels"
            :key="l.label"
            :x="l.x" :y="H - 2"
            font-size="9"
            fill="#71717a"
            text-anchor="middle"
          >{{ l.label }}</text>
        </svg>
      </div>

      <!-- Légende / classement -->
      <div class="space-y-2">
        <div
          v-for="(s, idx) in rankedSeries"
          :key="s.id"
          class="flex items-center justify-between bg-neutral-900/40 px-3.5 py-2.5 rounded-xl border border-neutral-800/60"
        >
          <div class="flex items-center gap-2.5 text-sm">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: s.color }"></span>
            <span class="text-neutral-500 font-mono text-xs">#{{ idx + 1 }}</span>
            <span>{{ s.icon }}</span>
            <span class="font-medium">{{ s.title }}</span>
          </div>
          <span class="text-xs font-mono" :style="{ color: s.color }">{{ s.total }}x</span>
        </div>
      </div>
    </template>
  </div>
</template>