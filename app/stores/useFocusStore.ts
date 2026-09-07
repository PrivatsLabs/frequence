// app/stores/useFocusStore.ts
import { defineStore } from 'pinia'

export interface Mission {
  id: string
  title: string
  startHour: number
  endHour: number
  durationMinutes?: number
}

export interface Task {
  id: string
  title: string
  completed: boolean
  time?: string
  category?: string
}

export interface Victory {
  id: string
  title: string
  completed: boolean
  label?: string
  category?: string
}

export interface HistoryEntry {
  date: string
  score: number
}

export interface FocusState {
  missions: Mission[]
  tasks: Task[]
  victories: Victory[]
  dailyHistory: HistoryEntry[]
  activeTaskIndex: number
}

export const useFocusStore = defineStore('focus', {
  state: (): FocusState => ({
    missions: [
      { id: '1', title: 'Session Deep Work Core', startHour: 9, endHour: 12, durationMinutes: 50 },
      { id: '2', title: 'Revue d\'Architecture & Code', startHour: 14, endHour: 16, durationMinutes: 45 },
      { id: '3', title: 'Planification & Clôture', startHour: 17, endHour: 18, durationMinutes: 25 }
    ],
    tasks: [
      { id: 't1', title: 'Valider le schéma de base de données', completed: false, time: '09:00 GMT', category: 'Dev' },
      { id: 't2', title: 'Configurer Tailwind v4 Vite', completed: true, time: '14:00 GMT', category: 'Setup' }
    ],
    victories: [
      { id: 'v1', title: 'Hydratation 2L d\'eau', label: 'Santé', category: 'Habitude', completed: false },
      { id: 'v2', title: '0 distraction téléphone', label: 'Focus', category: 'Discipline', completed: false }
    ],
    dailyHistory: [
      { date: 'Lun', score: 80 },
      { date: 'Mar', score: 95 },
      { date: 'Mer', score: 70 }
    ],
    activeTaskIndex: 0
  }),

  getters: {
    activeMission: (state): Mission | undefined => {
      const currentGmtHour = new Date().getUTCHours()
      return state.missions.find(
        (m) => currentGmtHour >= m.startHour && currentGmtHour < m.endHour
      )
    }
  },

  actions: {
    setActiveTask(index: number) {
      this.activeTaskIndex = index
    },
    toggleTask(id: string) {
      const task = this.tasks.find((t) => t.id === id)
      if (task) task.completed = !task.completed
    },
    toggleVictory(id: string) {
      const victory = this.victories.find((v) => v.id === id)
      if (victory) victory.completed = !victory.completed
    }
  }
})