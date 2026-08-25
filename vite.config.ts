import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/icon-32.png',
        'icons/icon-180.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-512-maskable.png',
        'icons/logo.png',
        'icons/parche.png',
        'icons/icon.svg',
      ],
      manifest: {
        name: 'Brutal Repertorio',
        short_name: 'Brutal',
        description: 'Catálogo de partituras con guardado offline selectivo',
        theme_color: '#c9a227',
        background_color: '#05080c',
        display: 'standalone',
        lang: 'es',
        start_url: './',
        scope: './',
        orientation: 'any',
        categories: ['music', 'education'],
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Solo shell de la app; los PDF se cachean a demanda vía Cache API.
        globPatterns: ['**/*.{js,mjs,css,html,ico,png,svg,woff2,json}'],
        navigateFallback: 'index.html',
        // Evita precachear assets enormes si se cuelan en public/
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.includes('/scores/') && url.pathname.endsWith('.pdf'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'scores-offline-v1',
              plugins: [
                {
                  cacheWillUpdate: async () => null,
                },
              ],
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    sourcemap: true,
  },
})
