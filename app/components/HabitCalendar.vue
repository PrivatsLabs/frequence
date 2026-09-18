<script setup lang="ts">
import { computed } from 'vue'
import { useFrequenceStore } from '@/stores/frequence'

const store = useFrequenceStore()

function safeCount(raw: unknown): number {
  return typeof raw === 'number' ? raw : 0
}

const recentDays = computed(() => {
  const days = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)

    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: store.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    const dateStr = formatter.format(d)

    const labelFormatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: store.timezone,
      weekday: 'narrow',
      day: 'numeric'
    })

    const count = safeCount(store.history[dateStr])

    days.push({
      date: dateStr,
      label: labelFormatter.format(d),
      count
    })
  }
  return days
})
</script>