<!-- app/components/CurrentMission.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFocusStore } from '~/stores/useFocusStore'

const store = useFocusStore()
const currentGmtHour = ref(new Date().getUTCHours())
let intervalId: ReturnType<typeof setInterval>

onMounted(() => {
  intervalId = setInterval(() => {
    currentGmtHour.value = new Date().getUTCHours()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})

// Détermine la mission active ou la plus proche
const activeMission = computed(() => {
  return store.missions.find(m => currentGmtHour.value >= m.startHour && currentGmtHour.value < m.endHour)
})

const isPassed = computed(() => {
  if (!activeMission.value) return false
  return currentGmtHour.value >= activeMission.value.endHour
})

const formatTime = (hour: number) => `${hour.toString().padStart(2, '0')}:00 GMT`
</script>

<template>
  <div class="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 text-center space-y-3">
    <div class="flex items-center justify-center gap-2 text-xs font-mono tracking-widest uppercase text-neutral-400">
      <span class="w-2 h-2 rounded-full" :class="activeMission ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'"></span>
      <span>Mission du Moment</span>
    </div>

    <!-- S'il y a une mission en cours -->
    <template v-if="activeMission">
      <h2 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
        {{ activeMission.title }}
      </h2>
      <div class="inline-block px-3 py-1 rounded-full text-xs font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
        {{ formatTime(activeMission.startHour) }} — {{ formatTime(activeMission.endHour) }}
      </div>
    </template>

    <!-- Si l'heure de la mission est dépassée / aucun créneau actif -->
    <template v-else>
      <h2 class="text-2xl font-bold text-neutral-500 line-through">
        Créneau Dépassé / Temps Libéré
      </h2>
      <p class="text-xs text-neutral-500 font-mono">
        Aucune mission planifiée pour l'heure GMT actuelle.
      </p>
    </template>
  </div>
</template>