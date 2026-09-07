<!-- pages/stats.vue -->
<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js'
import { useFocusStore } from '~/stores/useFocusStore'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

const store = useFocusStore()

const chartData = {
  labels: store.dailyHistory.map(h => h.date),
  datasets: [{
    label: 'Taux de Discipline (%)',
    backgroundColor: '#10b981',
    borderColor: '#10b981',
    data: store.dailyHistory.map(h => h.score),
    tension: 0.3
  }]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { min: 0, max: 100, grid: { color: '#262626' } },
    x: { grid: { color: '#262626' } }
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between border-b border-neutral-800 pb-6">
      <div>
        <h1 class="text-3xl font-black text-white tracking-tight">ANALYSE & PRODUCTIVITÉ</h1>
        <p class="text-sm text-neutral-400">Suivi de votre régularité et discipline sur le temps.</p>
      </div>
      <NuxtLink to="/" class="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm transition">
        ← Retour au Focus
      </NuxtLink>
    </div>

    <!-- Graphique principal -->
    <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <h3 class="text-lg font-bold text-white mb-6">Évolution de la Discipline (7 derniers jours)</h3>
      <div class="h-64">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>