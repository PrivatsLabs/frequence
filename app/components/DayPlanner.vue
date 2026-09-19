<script setup lang="ts">
import { computed } from 'vue'
import { useFrequenceStore } from '@/stores/frequence'
import { spawnRipple } from '~/utils/ripple'

const store = useFrequenceStore()

const viewTasks = computed(() => store.viewingTasks)
const viewCompletedCount = computed(() => viewTasks.value.filter(t => t.completed).length)
const viewTotalCount = computed(() => viewTasks.value.length)

const progress = computed(() => viewTotalCount.value > 0 ? viewCompletedCount.value / viewTotalCount.value : 0)
const R = 54
const CIRC = 2 * Math.PI * R
const dashoffset = computed(() => CIRC * (1 - progress.value))

const viewingDateLabel = computed(() => {
  const d = new Date(store.viewingDateEffective + 'T12:00:00')
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: store.timezone, weekday: 'long', day: 'numeric', month: 'long'
  }).format(d)
})

function handleTileClick(e: MouseEvent, id: string) {
  if (dragId.value) return
  spawnRipple(e)
  store.toggleTaskForDate(id)
}

// --- Drag to reorder (uniquement quand on regarde aujourd'hui) ---
const dragId = ref<string | null>(null)
const dragTranslateY = ref(0)
let startClientY = 0
let rowHeight = 0
let currentDragIndex = 0

function onHandlePointerDown(e: PointerEvent, taskId: string) {
  if (!store.isViewingToday) return
  e.stopPropagation()
  const row = (e.currentTarget as HTMLElement).closest('.task-row') as HTMLElement
  if (!row) return
  rowHeight = row.offsetHeight + 12
  startClientY = e.clientY
  currentDragIndex = store.tasks.findIndex(t => t.id === taskId)
  dragId.value = taskId
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  if ('vibrate' in navigator) navigator.vibrate(10)
}

function onPointerMove(e: PointerEvent) {
  if (!dragId.value) return
  const deltaY = e.clientY - startClientY
  dragTranslateY.value = deltaY

  const steps = Math.round(deltaY / rowHeight)
  const targetIndex = Math.min(Math.max(currentDragIndex + steps, 0), store.tasks.length - 1)

  if (targetIndex !== currentDragIndex) {
    const arr = [...store.tasks]
    const fromIndex = arr.findIndex(t => t.id === dragId.value)
    const item = arr[fromIndex]
    if (!item) return
    arr.splice(fromIndex, 1)
    arr.splice(targetIndex, 0, item)
    store.setTaskOrder(arr.map(t => t.id))
    currentDragIndex = targetIndex
    startClientY = e.clientY
    dragTranslateY.value = 0
  }
}

function onPointerUp() {
  dragId.value = null
  dragTranslateY.value = 0
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  store.persistOrder()
}
</script>

<template>
  <div class="w-full">
    <div
      class="flex items-center gap-5 p-5 mb-4 rounded-[28px]"
      style="background: var(--surface); box-shadow: var(--shadow-card);"
    >
      <svg width="104" height="104" viewBox="0 0 120 120" class="shrink-0 -rotate-90">
        <circle cx="60" cy="60" :r="R" fill="none" stroke="var(--surface-high)" stroke-width="10" />
        <circle
          cx="60" cy="60" :r="R" fill="none"
          :stroke="store.isViewingToday ? 'var(--ember)' : 'var(--violet)'" stroke-width="10" stroke-linecap="round"
          :stroke-dasharray="CIRC" :stroke-dashoffset="dashoffset"
          style="transition: stroke-dashoffset 700ms var(--ease-spring);"
        />
      </svg>
      <div class="flex-1">
        <h2 class="text-xl font-bold tracking-tight" style="font-family: var(--font-display);">
          {{ store.isViewingToday ? 'Rituels du jour' : 'Rituels du ' }}
        </h2>
        <p class="text-xs mb-2" style="color: var(--on-surface-dim);">
          {{ store.isViewingToday ? "Ce que tu fais obligatoirement aujourd'hui" : viewingDateLabel }}
        </p>
        <Transition name="pop" mode="out-in">
          <div :key="viewCompletedCount" class="text-2xl font-extrabold" :style="{ fontFamily: 'var(--font-display)', color: store.isViewingToday ? 'var(--ember)' : 'var(--violet)' }">
            {{ viewCompletedCount }}<span class="text-sm font-medium" style="color: var(--on-surface-faint);"> / {{ viewTotalCount }}</span>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Bandeau "consultation du passé" -->
    <Transition name="pop">
      <div
        v-if="!store.isViewingToday"
        class="flex items-center justify-between mb-4 p-3 rounded-2xl"
        style="background: var(--violet-container);"
      >
        <span class="text-xs font-medium" style="color: var(--violet);">📅 Tu corriges un jour passé</span>
        <button
          @click="store.resetViewingDate()"
          class="text-xs font-semibold px-3 py-1.5 rounded-xl"
          style="background: var(--surface); color: var(--violet);"
        >
          ← Revenir à aujourd'hui
        </button>
      </div>
    </Transition>

    <Transition name="pop">
      <div
        v-if="store.isViewingToday && viewTotalCount > 0 && viewCompletedCount === viewTotalCount"
        class="celebrate-in mb-5 p-4 rounded-[28px] text-center"
        style="background: var(--ember-container); box-shadow: var(--shadow-card);"
      >
        <div class="text-2xl mb-1">🔥 🏆 🔥</div>
        <h3 class="text-sm font-bold" style="color: var(--ember);">Journée Validée avec Succès !</h3>
        <p class="text-xs mt-0.5" style="color: var(--on-surface-dim);">Tous tes rituels sont accomplis. Repose-toi bien !</p>
      </div>
    </Transition>

    <div class="space-y-3">
      <div
        v-for="task in viewTasks"
        :key="task.id"
        class="task-row ripple-container flex items-center justify-between p-4 rounded-[20px] cursor-pointer select-none"
        :style="{
          background: 'var(--surface)',
          boxShadow: task.id === dragId ? '0 20px 40px -12px rgba(0,0,0,0.35)' : 'var(--shadow-card)',
          transform: task.id === dragId
            ? `translateY(${dragTranslateY}px) scale(1.02)`
            : (task.completed ? 'scale(0.99)' : 'scale(1)'),
          zIndex: task.id === dragId ? 10 : 1,
          transition: task.id === dragId ? 'none' : 'all 320ms var(--ease-spring)',
          opacity: task.completed ? 0.85 : 1
        }"
        @click="handleTileClick($event, task.id)"
      >
        <div class="flex items-center gap-2.5 flex-1 pr-3">
          <span
            v-if="store.isViewingToday"
            class="text-base px-1 py-2 touch-none"
            style="color: var(--on-surface-faint); cursor: grab;"
            @pointerdown="onHandlePointerDown($event, task.id)"
            @click.stop
          >⠿</span>

          <span
            class="text-xl w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            :style="{
              background: task.color,
              boxShadow: `0 8px 16px -6px ${task.color}99`,
              transform: task.completed ? 'scale(1.06)' : 'scale(1)',
              transition: 'all 320ms var(--ease-spring)'
            }"
          >
            {{ task.icon || '⚡' }}
          </span>
          <span
            class="text-base font-medium"
            :style="{
              color: task.completed ? 'var(--on-surface-dim)' : 'var(--on-surface)',
              textDecoration: task.completed ? 'line-through' : 'none',
              transition: 'color 320ms ease'
            }"
          >
            {{ task.title }}
          </span>
        </div>

        <div
          class="w-8 h-8 rounded-2xl flex items-center justify-center shrink-0"
          :style="{
            background: task.completed ? task.color : 'transparent',
            border: task.completed ? 'none' : '2px solid var(--surface-hairline)',
            boxShadow: task.completed ? `0 4px 10px -3px ${task.color}99` : 'none',
            transform: task.completed ? 'rotate(6deg) scale(1)' : 'scale(0.9)',
            transition: 'all 380ms var(--ease-spring)'
          }"
        >
          <svg v-if="task.completed" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#fff" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>