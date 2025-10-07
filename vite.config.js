import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/apple-touch-icon-180.png'],
      manifest: {
        name: 'Noah Math',
        short_name: 'NoahMath',
        description: 'Quick-fire multiplication quiz with selectable tables.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#16a34a',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          { urlPattern: ({ request }) => request.destination === 'document', handler: 'NetworkFirst', options: { cacheName: 'html-cache' } },
          { urlPattern: ({ request }) => ['style','script','worker'].includes(request.destination), handler: 'StaleWhileRevalidate', options: { cacheName: 'assets-cache' } },
          { urlPattern: ({ request }) => request.destination === 'image', handler: 'CacheFirst', options: { cacheName: 'image-cache', expiration: { maxEntries: 60, maxAgeSeconds: 2592000 } } }
        ]
      }
    })
  ]
})
