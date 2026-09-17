import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAVuTE0HXn6x6JhypBDtElazF-u0gfLRV8",
  authDomain: "frequence-c7705.firebaseapp.com",
  projectId: "frequence-c7705",
  storageBucket: "frequence-c7705.firebasestorage.app",
  messagingSenderId: "716419624312",
  appId: "1:716419624312:web:6430e20c5a4d6dad7aac8d"
};

// Initialisation unique sécurisée
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db: Firestore = getFirestore(app)
const auth: Auth = getAuth(app)

// Export direct pour ton store Pinia
export { db, auth }

// Export par défaut pour Nuxt
export default defineNuxtPlugin(() => {
  return {
    provide: {
      db,
      auth
    }
  }
})