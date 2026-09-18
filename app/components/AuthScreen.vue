<script setup lang="ts">
import { ref } from 'vue'
import { useFrequenceStore } from '@/stores/frequence'

const store = useFrequenceStore()
const mode = ref<'login' | 'signup'>('login')
const email = ref('')
const password = ref('')
const submitting = ref(false)

async function handleSubmit() {
  if (!email.value || !password.value) return
  submitting.value = true
  try {
    if (mode.value === 'signup') {
      await store.signUp(email.value, password.value)
    } else {
      await store.signIn(email.value, password.value)
    }
  } catch {
    // l'erreur est déjà stockée dans store.authError
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6" style="background: var(--bg); color: var(--on-surface);">
    <div class="w-full max-w-sm">
      <h1
        class="text-3xl font-extrabold tracking-tight text-center mb-1"
        style="font-family: var(--font-display); background: linear-gradient(135deg, var(--ember), #ffb673); -webkit-background-clip: text; background-clip: text; color: transparent;"
      >
        FREQUENCE
      </h1>
      <p class="text-center text-sm mb-8" style="color: var(--on-surface-dim);">
        {{ mode === 'login' ? 'Connecte-toi à tes rituels' : 'Crée ton espace personnel' }}
      </p>

      <form @submit.prevent="handleSubmit" class="p-5 rounded-[28px] space-y-3.5" style="background: var(--surface); box-shadow: var(--shadow-card);">
        <div>
          <label class="block text-xs font-medium mb-1.5" style="color: var(--on-surface-dim);">Email</label>
          <input
            v-model="email" type="email" required autocomplete="email"
            class="w-full px-3 py-2.5 rounded-2xl focus:outline-none"
            style="background: var(--surface-high); border: 1px solid var(--surface-hairline); color: var(--on-surface); font-size: 18px;"
          />
        </div>
        <div>
          <label class="block text-xs font-medium mb-1.5" style="color: var(--on-surface-dim);">Mot de passe</label>
          <input
            v-model="password" type="password" required
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
            class="w-full px-3 py-2.5 rounded-2xl focus:outline-none"
            style="background: var(--surface-high); border: 1px solid var(--surface-hairline); color: var(--on-surface); font-size: 18px;"
          />
        </div>

        <p v-if="store.authError" class="text-xs" style="color: #C0392B;">{{ store.authError }}</p>

        <button
          type="submit" :disabled="submitting"
          class="w-full font-bold py-3 rounded-2xl text-sm transition-transform active:scale-95 disabled:opacity-60"
          style="background: var(--ember); color: var(--surface);"
        >
          {{ submitting ? '...' : (mode === 'login' ? 'Se connecter' : "Créer mon compte") }}
        </button>
      </form>

      <button
        @click="mode = mode === 'login' ? 'signup' : 'login'; store.authError = null"
        class="w-full text-center text-xs mt-5"
        style="color: var(--on-surface-dim);"
      >
        {{ mode === 'login' ? "Pas encore de compte ? Crée-en un" : "Déjà un compte ? Connecte-toi" }}
      </button>
    </div>
  </div>
</template>