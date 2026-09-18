<script setup lang="ts">
import { ref } from 'vue'
import { useFrequenceStore } from '@/stores/frequence'
import { spawnRipple } from '~/utils/ripple'

const store = useFrequenceStore()
const isOpen = ref(false)
const newTaskTitle = ref('')
const newTaskIcon = ref('⚡')
const editingId = ref<string | null>(null)
const editingTitle = ref('')

const emojis = ['⚡', '🏃‍♂️', '📚', '💻', '🧘', '💧', '🎯', '🔥', '✍️', '🍎']

const timezones = [
  { label: 'UTC / GMT (Londres)', value: 'UTC' },
  { label: 'GMT+1 (Paris, Casablanca, Bruxelles)', value: 'Europe/Paris' },
  { label: 'GMT+2 (Le Caire, Johannesburg)', value: 'Africa/Cairo' },
  { label: 'GMT-5 (New York)', value: 'America/New_York' },
  { label: 'GMT-8 (Los Angeles)', value: 'America/Los_Angeles' },
]

const handleAdd = () => {
  if (newTaskTitle.value) {
    store.addTask(newTaskTitle.value, newTaskIcon.value)
    newTaskTitle.value = ''
    newTaskIcon.value = '⚡'
  }
}

const startEdit = (task: { id: string, title: string }) => {
  editingId.value = task.id
  editingTitle.value = task.title
}

const saveEdit = (id: string) => {
  if (editingTitle.value) store.updateTask(id, editingTitle.value)
  editingId.value = null
}
</script>

<template>
  <div>
    <button
      @click="(e) => { spawnRipple(e); isOpen = true }"
      class="ripple-container flex items-center justify-center w-11 h-11 rounded-2xl transition-transform active:scale-90"
      style="background: var(--surface-high); color: var(--on-surface);"
      title="Paramètres"
    >
      ⚙️
    </button>

    <Teleport to="body">
      <Transition name="backdrop">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style="background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);"
          @click.self="isOpen = false"
        >
          <Transition name="sheet" appear>
            <div
              v-if="isOpen"
              class="w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto pb-16"
              style="background: var(--surface); border: 1px solid var(--surface-hairline); border-radius: 28px 28px 0 0;"
            >
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-lg font-bold" style="font-family: var(--font-display);">Paramètres & Rituels</h2>
                <button
                  @click="(e) => { spawnRipple(e); isOpen = false }"
                  class="ripple-container text-xs px-3 py-1.5 rounded-xl font-medium"
                  style="background: var(--surface-high); color: var(--on-surface-dim);"
                >
                  Fermer
                </button>
              </div>

              <div class="mb-6">
                <label class="block text-xs font-medium mb-2" style="color: var(--on-surface-dim);">Fuseau horaire</label>
                <select
                  :value="store.timezone"
                  @change="store.setTimezone(($event.target as HTMLSelectElement).value)"
                  class="w-full px-3 py-2.5 rounded-2xl text-sm focus:outline-none"
                  style="background: var(--surface-high); border: 1px solid var(--surface-hairline); color: var(--on-surface);"
                >
                  <option v-for="tz in timezones" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
                </select>
              </div>

              <div class="mb-4">
                <label class="block text-xs font-medium mb-2" style="color: var(--on-surface-dim);">Ajouter un nouveau rituel</label>

                <form @submit.prevent="handleAdd" class="space-y-3 mb-6 p-3.5 rounded-[20px]" style="background: var(--surface-high); border: 1px solid var(--surface-hairline);">
                  <div class="flex gap-2">
                    <input
                      v-model="newTaskTitle"
                      type="text"
                      placeholder="Nom du rituel..."
                      class="flex-1 px-3 py-2.5 rounded-2xl text-sm focus:outline-none"
                      style="background: var(--surface); border: 1px solid var(--surface-hairline); color: var(--on-surface);"
                    />
                    <button
                      type="submit"
                      @click="spawnRipple"
                      class="ripple-container font-bold px-4 py-2.5 rounded-2xl text-sm transition-transform active:scale-95"
                      style="background: var(--ember); color: #15120f;"
                    >
                      Ajouter
                    </button>
                  </div>

                  <div class="flex items-center gap-1.5 overflow-x-auto py-1">
                    <span class="text-xs mr-1" style="color: var(--on-surface-faint);">Icône :</span>
                    <button
                      v-for="emoji in emojis" :key="emoji" type="button"
                      @click="newTaskIcon = emoji"
                      class="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 transition-all"
                      :style="{
                        background: newTaskIcon === emoji ? 'var(--ember-container)' : 'var(--surface)',
                        border: newTaskIcon === emoji ? '1px solid var(--ember)' : '1px solid var(--surface-hairline)',
                        transform: newTaskIcon === emoji ? 'scale(1.08)' : 'scale(1)'
                      }"
                    >
                      {{ emoji }}
                    </button>
                  </div>
                </form>

                <label class="block text-xs font-medium mb-2" style="color: var(--on-surface-dim);">Modifier / Supprimer</label>

                <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <div
                    v-for="task in store.tasks" :key="task.id"
                    class="flex items-center justify-between p-3 rounded-2xl"
                    style="background: var(--surface-high); border: 1px solid var(--surface-hairline);"
                  >
                    <div v-if="editingId === task.id" class="flex-1 flex gap-2 mr-2">
                      <input
                        v-model="editingTitle" @keyup.enter="saveEdit(task.id)" type="text"
                        class="w-full px-2.5 py-1 rounded-lg text-xs"
                        style="background: var(--surface); border: 1px solid var(--surface-hairline); color: var(--on-surface);"
                      />
                      <button @click="saveEdit(task.id)" class="text-xs px-2.5 py-1 rounded-lg font-medium" style="background: var(--ember); color: #15120f;">OK</button>
                    </div>
                    <span v-else class="text-sm truncate flex-1 pr-2 flex items-center gap-2">
                      <span>{{ task.icon || '⚡' }}</span> {{ task.title }}
                    </span>

                    <div class="flex items-center gap-1 text-xs" style="color: var(--on-surface-dim);">
                      <button @click="startEdit(task)" class="p-1.5">✏️</button>
                      <button @click="store.deleteTask(task.id)" class="p-1.5">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>