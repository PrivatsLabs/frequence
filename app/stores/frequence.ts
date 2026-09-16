import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Task {
  id: string
  title: string
  icon?: string
  completed: boolean
}

export const useFrequenceStore = defineStore('frequence', () => {
  // --- STATE ---
  const tasks = ref<Task[]>([
    { id: '1', title: 'Sport / Mobilité', icon: '🏃‍♂️', completed: false },
    { id: '2', title: 'Lecture (30 min)', icon: '📚', completed: false },
    { id: '3', title: 'Avancer sur le projet web', icon: '💻', completed: false },
  ])
  
  const history = ref<Record<string, number>>({})
  const timezone = ref<string>('Europe/Paris')

  // --- GETTERS ---
  const todayKey = computed<string>(() => {
    const d = new Date()
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone.value,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    return formatter.format(d)
  })

  const completedCount = computed<number>(() => {
    return tasks.value.filter(t => t.completed).length
  })

  const totalCount = computed<number>(() => {
    return tasks.value.length
  })

  // --- ACTIONS ---
  function setTimezone(tz: string) {
    timezone.value = tz
  }

  function toggleTask(id: string) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    if (task.completed) {
      return
    }

    const confirmed = window.confirm(`Veux-tu vraiment confirmer et valider ton rituel : "${task.title}" ? (Impossible de revenir en arrière pour aujourd'hui)`)
    
    if (confirmed) {
      task.completed = true
      history.value[todayKey.value] = completedCount.value
    }
  }

  function addTask(title: string, icon: string = '⚡') {
    if (!title.trim()) return
    tasks.value.push({
      id: Date.now().toString(),
      title: title.trim(),
      icon,
      completed: false
    })
  }

  function updateTask(id: string, newTitle: string) {
    const task = tasks.value.find(t => t.id === id)
    if (task && newTitle.trim()) {
      task.title = newTitle.trim()
    }
  }

  function deleteTask(id: string) {
    tasks.value = tasks.value.filter(t => t.id !== id)
    history.value[todayKey.value] = completedCount.value
  }

  return {
    tasks,
    history,
    timezone,
    todayKey,
    completedCount,
    totalCount,
    setTimezone,
    toggleTask,
    addTask,
    updateTask,
    deleteTask
  }
}, {
 
  persist: true
} as any)