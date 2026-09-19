import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, auth } from '~/utils/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut
} from 'firebase/auth'
import { nextColor } from '~/utils/palette'
import { playTaskComplete, playAllComplete } from '~/utils/sound'
import { hapticTick, hapticSuccess } from '~/utils/haptics'

export interface Task {
  id: string
  title: string
  icon?: string
  completed: boolean
  color?: string
}



function mapAuthError(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'Cet email est déjà utilisé.',
    'auth/invalid-email': 'Adresse email invalide.',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/user-not-found': 'Aucun compte ne correspond à cet email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/invalid-credential': 'Email ou mot de passe incorrect.',
    'auth/too-many-requests': 'Trop de tentatives. Réessaie plus tard.',
  }
  return map[code] || 'Une erreur est survenue.'
}

export const useFrequenceStore = defineStore('frequence', () => {
  const userId = ref<string | null>(null)
  const userEmail = ref<string | null>(null)
  const authLoading = ref(true)
  const authError = ref<string | null>(null)

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
    if (!userId.value) return
    try {
      await setDoc(doc(db, 'frequence_data', userId.value), {
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

  function applyData(data: any) {
    if (data.tasks) tasks.value = data.tasks
    if (data.history) history.value = data.history
    if (data.taskLog) taskLog.value = data.taskLog
    if (data.timezone) timezone.value = data.timezone
    if (data.lastActiveDay) lastActiveDay.value = data.lastActiveDay

    let needsColorSave = false
    tasks.value = tasks.value.map((t, i) => {
      if (!t.color) {
        needsColorSave = true
        return { ...t, color: nextColor(i) }
      }
      return t
    })
    return needsColorSave
  }

  async function loadDataFromCloud(uid: string) {
    try {
      const docSnap = await getDoc(doc(db, 'frequence_data', uid))
      if (docSnap.exists()) {
        const needsColorSave = applyData(docSnap.data())
        resetIfNewDay()
        if (needsColorSave) await saveDataToCloud()
      } else {
        // Migration ponctuelle : récupère les données de l'ancien mode mono-utilisateur
        // pour le premier compte qui se connecte (une seule fois, tant qu'aucun doc n'existe pour ce uid)
        const legacySnap = await getDoc(doc(db, 'frequence_data', 'default_user_data'))
        if (legacySnap.exists()) {
          applyData(legacySnap.data())
          lastActiveDay.value = todayKey.value
          await saveDataToCloud()
        } else {
          tasks.value = [
            { id: '1', title: 'Sport / Mobilité', icon: '🏃‍♂️', completed: false, color: nextColor(0) },
            { id: '2', title: 'Lecture (30 min)', icon: '📚', completed: false, color: nextColor(1) },
            { id: '3', title: 'Avancer sur le projet web', icon: '💻', completed: false, color: nextColor(2) },
          ]
          lastActiveDay.value = todayKey.value
          await saveDataToCloud()
        }
      }
    } catch (error) {
      console.error("Erreur de chargement Firebase :", error)
    }
  }

  function initAuth() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        userId.value = user.uid
        userEmail.value = user.email
        await loadDataFromCloud(user.uid)
      } else {
        userId.value = null
        userEmail.value = null
        tasks.value = []
        history.value = {}
        taskLog.value = {}
        lastActiveDay.value = ''
      }
      authLoading.value = false
    })
  }

  async function signUp(email: string, password: string) {
    authError.value = null
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (e: any) {
      authError.value = mapAuthError(e.code)
      throw e
    }
  }

  async function signIn(email: string, password: string) {
    authError.value = null
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e: any) {
      authError.value = mapAuthError(e.code)
      throw e
    }
  }

  async function logout() {
    await fbSignOut(auth)
  }

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

      hapticTick()
      playTaskComplete()
      if (completedCount.value === totalCount.value) {
        hapticSuccess()
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

  function setTaskOrder(orderedIds: string[]) {
    const map = new Map(tasks.value.map(t => [t.id, t]))
    tasks.value = orderedIds.map(id => map.get(id)).filter((t): t is Task => !!t)
  }

  function persistOrder() {
    saveDataToCloud()
  }

async function migrateFromLegacy() {
  if (!userId.value) return false
  try {
    const legacySnap = await getDoc(doc(db, 'frequence_data', 'default_user_data'))
    if (legacySnap.exists()) {
      applyData(legacySnap.data())
      await saveDataToCloud()
      return true
    }
    return false
  } catch (error) {
    console.error("Erreur de migration :", error)
    return false
  }
}

// --- Consultation / édition d'un jour passé ---
const viewingDate = ref<string>('') // vide = on regarde aujourd'hui

const viewingDateEffective = computed(() => viewingDate.value || todayKey.value)
const isViewingToday = computed(() => viewingDateEffective.value === todayKey.value)

const viewingTasks = computed(() => {
  if (isViewingToday.value) return tasks.value
  const dayIds = taskLog.value[viewingDateEffective.value] || []
  return tasks.value.map(t => ({ ...t, completed: dayIds.includes(t.id) }))
})

function setViewingDate(date: string) {
  viewingDate.value = date
}

function resetViewingDate() {
  viewingDate.value = ''
}

function toggleTaskForDate(id: string) {
  if (isViewingToday.value) {
    toggleTask(id)
    return
  }
  const date = viewingDateEffective.value
  const dayLog = taskLog.value[date] ?? []
  const idx = dayLog.indexOf(id)
  if (idx >= 0) {
    dayLog.splice(idx, 1)
  } else {
    dayLog.push(id)
  }
  taskLog.value[date] = dayLog
  history.value[date] = dayLog.length
  saveDataToCloud()

  hapticTick()
  playTaskComplete()
}
  

  return {
    userId, userEmail, authLoading, authError,
    tasks, history, taskLog, timezone, lastActiveDay, todayKey,
    completedCount, totalCount, taskStats,
    initAuth, signUp, signIn, logout,
    setTimezone, toggleTask, addTask, updateTask, deleteTask,
    setTaskOrder, persistOrder,viewingDate, viewingDateEffective, isViewingToday, viewingTasks,
setViewingDate, resetViewingDate, toggleTaskForDate
    
  }
})