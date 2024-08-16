// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui', 'nuxt-gtag', "@pinia/nuxt"],
  app: {
    head: {
      title: 'DraughtSheets',
    },
  },
  gtag: {
    id: 'G-GBMNE32KND',
  },
});