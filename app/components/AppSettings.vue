<script setup lang="ts">
import { ref } from 'vue'
import { useFrequenceStore } from '@/stores/frequence'

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
  if (editingTitle.value) {
    store.updateTask(id, editingTitle.value)
  }
  editingId.value = null
}
</script>

<template>
  <div>
    <!-- Bouton Paramètres bien visible en vert -->
    <button 
      @click="isOpen = true"
      class="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-md active:scale-95"
      title="Paramètres"
    >
      ⚙️
    </button>

    <!-- Modal / Tiroir Paramètres -->
    <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="w-full sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
        
        <!-- En-tête modal -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold">Paramètres & Rituels</h2>
          <button @click="isOpen = false" class="text-neutral-400 hover:text-white text-xs bg-neutral-800 px-3 py-1.5 rounded-xl font-medium">
            Fermer
          </button>
        </div>

        <!-- Choix du Timezone / GMT -->
        <div class="mb-6">
          <label class="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Fuseau Horaire (GMT)</label>
          <select 
            :value="store.timezone"
            @change="store.setTimezone(($event.target as HTMLSelectElement).value)"
            class="w-full bg-neutral-800 border border-neutral-700 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
              {{ tz.label }}
            </option>
          </select>
        </div>

        <!-- Gestion des Tâches -->
        <div class="mb-4">
          <label class="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Ajouter un nouveau rituel</label>
          
          <form @submit.prevent="handleAdd" class="space-y-3 mb-6 bg-neutral-800/40 p-3.5 rounded-2xl border border-neutral-800">
            <div class="flex gap-2">
              <input 
                v-model="newTaskTitle"
                type="text"
                placeholder="Nom du rituel..."
                class="flex-1 bg-neutral-900 border border-neutral-700 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <button type="submit" class="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
                Ajouter
              </button>
            </div>
            
            <div class="flex items-center gap-1.5 overflow-x-auto py-1">
              <span class="text-xs text-neutral-400 mr-1">Icône :</span>
              <button 
                v-for="emoji in emojis" 
                :key="emoji"
                type="button"
                @click="newTaskIcon = emoji"
                :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all',
                  newTaskIcon === emoji ? 'bg-emerald-500/20 border border-emerald-500 text-white' : 'bg-neutral-900 border border-neutral-800 text-neutral-400'
                ]"
              >
                {{ emoji }}
              </button>
            </div>
          </form>

          <label class="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Modifier / Supprimer</label>
          
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <div v-for="task in store.tasks" :key="task.id" class="flex items-center justify-between bg-neutral-800/50 p-3 rounded-xl border border-neutral-800">
              <div v-if="editingId === task.id" class="flex-1 flex gap-2 mr-2">
                <input 
                  v-model="editingTitle"
                  @keyup.enter="saveEdit(task.id)"
                  type="text"
                  class="w-full bg-neutral-900 border border-neutral-700 px-2.5 py-1 rounded-lg text-xs text-white"
                />
                <button @click="saveEdit(task.id)" class="text-xs bg-emerald-600 px-2.5 py-1 rounded-lg font-medium">OK</button>
              </div>
              <span v-else class="text-sm truncate flex-1 pr-2 flex items-center gap-2">
                <span>{{ task.icon || '⚡' }}</span> {{ task.title }}
              </span>

              <div class="flex items-center gap-1 text-xs text-neutral-400">
                <button @click="startEdit(task)" class="p-1.5 hover:text-white transition-colors">✏️</button>
                <button @click="store.deleteTask(task.id)" class="p-1.5 hover:text-red-400 transition-colors">🗑️</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>