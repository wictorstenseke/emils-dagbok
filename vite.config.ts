import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  server: {
    host: true,
  },
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Emils Dagbok',
        short_name: 'Dagbok',
        description: 'Min hemliga dagbok',
        theme_color: '#FDF6E3',
        background_color: '#FDF6E3',
        display: 'standalone',
        icons: [
          { src: `${base}icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
