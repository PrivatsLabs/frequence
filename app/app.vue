<script setup lang="ts">
const currentTime = ref('')

function updateTime() {
  currentTime.value = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date())
}

let timer: ReturnType<typeof setInterval>

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div
    class="min-h-screen bg-black text-neutral-100 font-sans selection:bg-emerald-500 selection:text-black"
  >
    <!-- Heure GMT -->
    <header class="max-w-6xl mx-auto px-4 pt-5">
      <div class="flex justify-end">
        <div class="flex items-center gap-2 text-neutral-400">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>

          <span class="font-mono text-xs tracking-wide text-neutral-200">
            {{ currentTime }}
          </span>

          <span class="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            GMT
          </span>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-8">
      <NuxtPage />
    </main>
  </div>
</template>