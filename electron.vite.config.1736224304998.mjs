// electron.vite.config.ts
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
var __electron_vite_injected_dirname =
  'C:\\Users\\anant\\OneDrive\\Desktop\\Brocamp\\second project\\FlareCast-Electron'
var electron_vite_config_default = defineConfig({
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
          main: resolve(__electron_vite_injected_dirname, 'src/renderer/index.html'),
          studio: resolve(__electron_vite_injected_dirname, 'src/renderer/studio.html')
        }
      }
    }
  }
})
export { electron_vite_config_default as default }
