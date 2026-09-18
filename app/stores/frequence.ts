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
  const taskLog = ref<Record<string, string[]>>({})
  const timezone = ref<string>('Europe/Paris')
  // NOUVEAU : dernier jour où l'utilisateur était actif, pour détecter le changement de jour
  const lastActiveDay = ref<string>('')

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

  async function saveDataToCloud() {
    try {
      await setDoc(doc(db, 'frequence_data', docId), {
        tasks: tasks.value,
        history: history.value,
        taskLog: taskLog.value,
        timezone: timezone.value,
        lastActiveDay: lastActiveDay.value
      })
    } catch (error) {
      console.error("Erreur de sauvegarde Firebase :", error)
    }
  }

  // Si on a changé de jour depuis la dernière visite, on décoche tout
  function resetIfNewDay() {
    const today = todayKey.value
    if (lastActiveDay.value && lastActiveDay.value !== today) {
      tasks.value.forEach(t => { t.completed = false })
      lastActiveDay.value = today
      saveDataToCloud()
    } else if (!lastActiveDay.value) {
      lastActiveDay.value = today
    }
  }

  async function loadDataFromCloud() {
    try {
      const docSnap = await getDoc(doc(db, 'frequence_data', docId))
      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.tasks) tasks.value = data.tasks
        if (data.history) history.value = data.history
        if (data.taskLog) taskLog.value = data.taskLog
        if (data.timezone) timezone.value = data.timezone
        if (data.lastActiveDay) lastActiveDay.value = data.lastActiveDay

        resetIfNewDay()
      } else {
        tasks.value = [
          { id: '1', title: 'Sport / Mobilité', icon: '🏃‍♂️', completed: false },
          { id: '2', title: 'Lecture (30 min)', icon: '📚', completed: false },
          { id: '3', title: 'Avancer sur le projet web', icon: '💻', completed: false },
        ]
        lastActiveDay.value = todayKey.value
        await saveDataToCloud()
      }
    } catch (error) {
      console.error("Erreur de chargement Firebase :", error)
    }
  }

  loadDataFromCloud()

  const completedCount = computed<number>(() => tasks.value.filter(t => t.completed).length)
  const totalCount = computed<number>(() => tasks.value.length)

  const taskStats = computed(() => {
    const counts: Record<string, number> = {}
    tasks.value.forEach(t => { counts[t.id] = 0 })

    Object.values(taskLog.value).forEach(idsForDay => {
      idsForDay.forEach(id => {
        counts[id] = (counts[id] || 0) + 1
      })
    })

    return tasks.value
      .map(t => ({ id: t.id, title: t.title, icon: t.icon, count: counts[t.id] || 0 }))
      .sort((a, b) => b.count - a.count)
  })

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

    // Enregistrement dans le log par tâche
    const dayLog = taskLog.value[todayKey.value] ?? []
    if (!dayLog.includes(id)) {
      dayLog.push(id)
    }
    taskLog.value[todayKey.value] = dayLog

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
    taskLog,
    timezone,
    lastActiveDay,
    todayKey,
    completedCount,
    totalCount,
    taskStats,
    setTimezone,
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    loadDataFromCloud
  }
})