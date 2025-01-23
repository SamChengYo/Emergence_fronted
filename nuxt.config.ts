// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  components: true,
  modules: [
    ['unplugin-vue-inspector/nuxt', {
      enabled: true,
      toggleButtonVisibility: 'always',
    }],
  ],
  ssr: false,
  router: {
    middleware: ['auth']
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'fallback_secret'
  }
})
