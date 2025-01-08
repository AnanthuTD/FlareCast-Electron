/**
 * @type {import('electron-vite').UserConfig}
 */
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
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
    server: {
      proxy: {
        '/api/user': {
          target: 'http://localhost:4001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/user/, '/api')
        }
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/renderer/index.html'),
          studio: resolve(__dirname, 'src/renderer/studio.html')
        }
      }
    }
  }
})
