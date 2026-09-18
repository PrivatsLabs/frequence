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
const editingIcon = ref('⚡')

const emojis = [
  '⚡', '🏃‍♂️', '📚', '💻', '🧘', '💧', '🎯', '🔥',
  '✍️', '🍎', '🙏', '🚴‍♂️', '🏋️‍♂️', '🥗', '😴', '🧠',
  '📖', '🎨', '🎸', '🧹', '💰', '🌱', '🚭', '❄️',
  '🎓', '📵', '🧘‍♂️', '🩺', '🗣️', '☀️', '🛌', '✅'
]

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

const startEdit = (task: { id: string, title: string, icon?: string }) => {
  editingId.value = task.id
  editingTitle.value = task.title
  editingIcon.value = task.icon || '⚡'
}

const saveEdit = (id: string) => {
  if (editingTitle.value) store.updateTask(id, editingTitle.value, editingIcon.value)
  editingId.value = null
}

const cancelEdit = () => {
  editingId.value = null
}
</script>

<template>
  <div>
    <button
      @click="(e) => { spawnRipple(e); isOpen = true }"
      class="ripple-container flex items-center justify-center w-11 h-11 rounded-2xl transition-transform active:scale-90"
      style="background: var(--surface); color: var(--on-surface); box-shadow: var(--shadow-card);"
      title="Paramètres"
    >
      ⚙️
    </button>

    <Teleport to="body">
      <Transition name="backdrop">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style="background: rgba(0,0,0,0.4); backdrop-filter: blur(6px);"
          @click.self="isOpen = false"
        >
          <Transition name="sheet" appear>
            <div
              v-if="isOpen"
              class="w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto pb-16"
              style="background: var(--surface); border-radius: 28px 28px 0 0; box-shadow: var(--shadow-card);"
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

                <form @submit.prevent="handleAdd" class="space-y-3 mb-6 p-3.5 rounded-[20px]" style="background: var(--surface-high); box-shadow: var(--shadow-card);">
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
                      style="background: var(--ember); color: var(--surface);"
                    >
                      Ajouter
                    </button>
                  </div>

                  <div>
                    <span class="text-xs block mb-1.5" style="color: var(--on-surface-faint);">Icône :</span>
                    <div class="grid grid-cols-8 gap-1.5">
                      <button
                        v-for="emoji in emojis" :key="emoji" type="button"
                        @click="newTaskIcon = emoji"
                        class="aspect-square rounded-xl flex items-center justify-center text-base transition-all"
                        :style="{
                          background: newTaskIcon === emoji ? 'var(--ember-container)' : 'var(--surface)',
                          border: newTaskIcon === emoji ? '1.5px solid var(--ember)' : '1px solid var(--surface-hairline)',
                          transform: newTaskIcon === emoji ? 'scale(1.08)' : 'scale(1)'
                        }"
                      >
                        {{ emoji }}
                      </button>
                    </div>
                  </div>
                </form>

                <label class="block text-xs font-medium mb-2" style="color: var(--on-surface-dim);">Modifier / Supprimer</label>

                <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                  <div
                    v-for="task in store.tasks" :key="task.id"
                    class="p-3 rounded-2xl"
                    style="background: var(--surface-high); box-shadow: var(--shadow-card);"
                  >
                    <template v-if="editingId === task.id">
                      <div class="flex gap-2 mb-3">
                        <input
                          v-model="editingTitle" @keyup.enter="saveEdit(task.id)" type="text"
                          class="flex-1 px-2.5 py-1.5 rounded-lg text-xs"
                          style="background: var(--surface); border: 1px solid var(--surface-hairline); color: var(--on-surface);"
                        />
                        <button @click="saveEdit(task.id)" class="text-xs px-3 py-1.5 rounded-lg font-medium shrink-0" style="background: var(--ember); color: var(--surface);">OK</button>
                        <button @click="cancelEdit" class="text-xs px-2.5 py-1.5 rounded-lg font-medium shrink-0" style="background: var(--surface); color: var(--on-surface-dim);">✕</button>
                      </div>
                      <div class="grid grid-cols-8 gap-1.5">
                        <button
                          v-for="emoji in emojis" :key="emoji" type="button"
                          @click="editingIcon = emoji"
                          class="aspect-square rounded-lg flex items-center justify-center text-sm transition-all"
                          :style="{
                            background: editingIcon === emoji ? 'var(--ember-container)' : 'var(--surface)',
                            border: editingIcon === emoji ? '1.5px solid var(--ember)' : '1px solid var(--surface-hairline)',
                            transform: editingIcon === emoji ? 'scale(1.08)' : 'scale(1)'
                          }"
                        >
                          {{ emoji }}
                        </button>
                      </div>
                    </template>

                    <div v-else class="flex items-center justify-between">
                      <span class="text-sm truncate flex-1 pr-2 flex items-center gap-2">
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
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>