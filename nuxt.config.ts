// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/google-fonts',
    'motion-v/nuxt',
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  css: ['~/assets/css/main.css'],

  googleFonts: {
    families: {
      Manrope: [400, 500, 600, 700, 800],
      'DM+Sans': [400, 500, 700],
    },
    display: 'swap',
    prefetch: true,
    preconnect: true,
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: 'Angkasa Raya Medika — Katalog Reagen & Bahan Laboratorium B2B',
      htmlAttrs: {
        lang: 'id',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Katalog reagen dan bahan laboratorium B2B dengan spesifikasi jelas. Melayani kebutuhan rumah sakit, laboratorium klinis, diagnostik, dan fasilitas riset.',
        },
        { name: 'theme-color', content: '#08AEB3' },
      ],
      link: [
        { rel: 'icon', type: 'image/jpeg', href: '/brand/logo_akm.jpg' },
      ],
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        'lucide-vue-next',
      ],
    },
  },

  compatibilityDate: '2024-11-01',
})
