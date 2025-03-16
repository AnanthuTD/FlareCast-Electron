/**
 * @type {import('electron-vite').UserConfig}
 */
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, loadEnv } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode)

  return {
    main: {
      plugins: [externalizeDepsPlugin()]
    },
    preload: {
      plugins: [externalizeDepsPlugin()]
    },
    renderer: {
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src')
        }
      },
      plugins: [react()],
      build: {
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'src/renderer/index.html'),
            studio: resolve(__dirname, 'src/renderer/studio.html'),
            webcam: resolve(__dirname, 'src/renderer/webcam.html')
          }
        }
      }
    }
  }
})
