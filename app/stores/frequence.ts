import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '~/utils/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export interface Task {
  id: string
  title: string
  icon?: string
  completed: boolean
}

export const useFrequenceStore = defineStore('frequence', () => {
  const docId = 'default_user_data'

  const tasks = ref<Task[]>([])
  const history = ref<Record<string, number>>({})
  const timezone = ref<string>('Europe/Paris')

  async function saveDataToCloud() {
    try {
      // db est directement importé, plus de risque qu'il soit undefined
      await setDoc(doc(db, 'frequence_data', docId), {
        tasks: tasks.value,
        history: history.value,
        timezone: timezone.value
      })
    } catch (error) {
      console.error("Erreur de sauvegarde Firebase :", error)
    }
  }

  async function loadDataFromCloud() {
    try {
      const docSnap = await getDoc(doc(db, 'frequence_data', docId))
      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.tasks) tasks.value = data.tasks
        if (data.history) history.value = data.history
        if (data.timezone) timezone.value = data.timezone
      } else {
        // Initialisation par défaut si la base est vide
        tasks.value = [
          { id: '1', title: 'Sport / Mobilité', icon: '🏃‍♂️', completed: false },
          { id: '2', title: 'Lecture (30 min)', icon: '📚', completed: false },
          { id: '3', title: 'Avancer sur le projet web', icon: '💻', completed: false },
        ]
        await saveDataToCloud()
      }
    } catch (error) {
      console.error("Erreur de chargement Firebase :", error)
    }
  }

  // Chargement immédiat
  loadDataFromCloud()

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

  const completedCount = computed<number>(() => tasks.value.filter(t => t.completed).length)
  const totalCount = computed<number>(() => tasks.value.length)

  function setTimezone(tz: string) {
    timezone.value = tz
    saveDataToCloud()
  }

  function toggleTask(id: string) {
    const task = tasks.value.find(t => t.id === id)
    if (!task || task.completed) return

    const confirmed = window.confirm(`Veux-tu vraiment confirmer et valider ton rituel : "${task.title}" ?`)
    if (confirmed) {
      task.completed = true
      history.value[todayKey.value] = completedCount.value
      saveDataToCloud()
    }
  }

  function addTask(title: string, icon: string = '⚡') {
    if (!title.trim()) return
    tasks.value.push({ id: Date.now().toString(), title: title.trim(), icon, completed: false })
    saveDataToCloud()
  }

  function updateTask(id: string, newTitle: string) {
    const task = tasks.value.find(t => t.id === id)
    if (task && newTitle.trim()) {
      task.title = newTitle.trim()
      saveDataToCloud()
    }
  }

  function deleteTask(id: string) {
    tasks.value = tasks.value.filter(t => t.id !== id)
    history.value[todayKey.value] = completedCount.value
    saveDataToCloud()
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
    deleteTask,
    loadDataFromCloud
  }
}, {
  persist: true
} as any)