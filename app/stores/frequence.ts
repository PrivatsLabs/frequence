import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '~/utils/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { nextColor } from '~/utils/palette'
import { playTaskComplete, playAllComplete } from '~/utils/sound'

export interface Task {
  id: string
  title: string
  icon?: string
  completed: boolean
  color?: string
}

export const useFrequenceStore = defineStore('frequence', () => {
  const docId = 'default_user_data'

  const tasks = ref<Task[]>([])
  const history = ref<Record<string, number>>({})
  const taskLog = ref<Record<string, string[]>>({})
  const timezone = ref<string>('Europe/Paris')
  const lastActiveDay = ref<string>('')

  const todayKey = computed<string>(() => {
    const d = new Date()
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone.value, year: 'numeric', month: '2-digit', day: '2-digit'
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

        // Attribue une couleur aux tâches créées avant ce changement
        let needsColorSave = false
        tasks.value = tasks.value.map((t, i) => {
          if (!t.color) {
            needsColorSave = true
            return { ...t, color: nextColor(i) }
          }
          return t
        })

        resetIfNewDay()
        if (needsColorSave) await saveDataToCloud()
      } else {
        tasks.value = [
          { id: '1', title: 'Sport / Mobilité', icon: '🏃‍♂️', completed: false, color: nextColor(0) },
          { id: '2', title: 'Lecture (30 min)', icon: '📚', completed: false, color: nextColor(1) },
          { id: '3', title: 'Avancer sur le projet web', icon: '💻', completed: false, color: nextColor(2) },
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
      idsForDay.forEach(id => { counts[id] = (counts[id] || 0) + 1 })
    })
    return tasks.value
      .map(t => ({ id: t.id, title: t.title, icon: t.icon, color: t.color, count: counts[t.id] || 0 }))
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

      const dayLog = taskLog.value[todayKey.value] ?? []
      if (!dayLog.includes(id)) dayLog.push(id)
      taskLog.value[todayKey.value] = dayLog

      saveDataToCloud()

      playTaskComplete()
      if (completedCount.value === totalCount.value) {
        setTimeout(() => playAllComplete(), 180)
      }
    }
  }

  function addTask(title: string, icon: string = '⚡') {
    if (!title.trim()) return
    const color = nextColor(tasks.value.length)
    tasks.value.push({ id: Date.now().toString(), title: title.trim(), icon, completed: false, color })
    saveDataToCloud()
  }

function updateTask(id: string, newTitle: string, newIcon?: string) {
  const task = tasks.value.find(t => t.id === id)
  if (task && newTitle.trim()) {
    task.title = newTitle.trim()
    if (newIcon) task.icon = newIcon
    saveDataToCloud()
  }
}

  function deleteTask(id: string) {
    tasks.value = tasks.value.filter(t => t.id !== id)
    history.value[todayKey.value] = completedCount.value
    saveDataToCloud()
  }

  return {
    tasks, history, taskLog, timezone, lastActiveDay, todayKey,
    completedCount, totalCount, taskStats,
    setTimezone, toggleTask, addTask, updateTask, deleteTask, loadDataFromCloud
  }
})