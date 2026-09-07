import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-06',
  css: ['~/assets/css/main.css'],
  modules: [
    '@pinia/nuxt'
  ],
  vite: {
    plugins: [
      tailwindcss()
    ]
  }
})