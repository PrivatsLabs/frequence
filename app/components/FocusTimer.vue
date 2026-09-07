<!-- app/components/FocusTimer.vue -->
<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useFocusStore } from '~/stores/useFocusStore'

const store = useFocusStore()
const defaultDurationMinutes = 25

const timeLeft = ref((store.activeMission?.durationMinutes ?? defaultDurationMinutes) * 60)
const isRunning = ref(false)
let timerInterval: ReturnType<typeof setInterval> | null = null

// Functions déclarées avant d'être appelées par le watcher
function stopTimer() {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function startTimer() {
  if (isRunning.value) return
  isRunning.value = true
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      stopTimer()
    }
  }, 1000)
}

function resetTimer() {
  stopTimer()
  const minutes = store.activeMission?.durationMinutes ?? defaultDurationMinutes
  timeLeft.value = minutes * 60
}

// Watcher sécurisé qui appelle stopTimer() déjà initialisé
watch(
  () => store.activeMission,
  (newMission) => {
    stopTimer()
    const minutes = newMission?.durationMinutes ?? defaultDurationMinutes
    timeLeft.value = minutes * 60
  },
  { immediate: true }
)

onUnmounted(() => {
  stopTimer()
})

const formattedTime = computed(() => {
  const h = Math.floor(timeLeft.value / 3600)
  const m = Math.floor((timeLeft.value % 3600) / 60)
  const s = timeLeft.value % 60
  
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})
</script>

<template>
  <div class="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-8 text-center space-y-6 backdrop-blur">
    <div class="text-6xl md:text-7xl font-mono font-bold tracking-tight text-white">
      {{ formattedTime }}
    </div>

    <div class="flex justify-center gap-4">
      <button 
        @click="isRunning ? stopTimer() : startTimer()"
        class="px-6 py-3 rounded-xl font-bold transition-all cursor-pointer"
        :class="isRunning ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20' : 'bg-emerald-500 text-black hover:bg-emerald-400'"
      >
        {{ isRunning ? 'Pause' : 'Démarrer' }}
      </button>

      <button 
        @click="resetTimer"
        class="px-4 py-3 bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer"
      >
        Réinitialiser
      </button>
    </div>
  </div>
</template>