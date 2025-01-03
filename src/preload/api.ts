import { ipcRenderer } from 'electron'
import { AppEvents } from '../main/events'

const api = {
  auth: {
    onAuthSuccess: (callback: (data: { refreshToken: string }) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, data: { refreshToken: string }) => {
        if (data && typeof data.refreshToken === 'string') {
          console.log('Received refresh token in preload:', data.refreshToken)
          callback(data)
        } else {
          console.error('Invalid data received for AUTHENTICATION_SUCCESS:', data)
        }
      }
      ipcRenderer.on(AppEvents.AUTHENTICATION_SUCCESS, listener)
      return () => ipcRenderer.removeListener(AppEvents.AUTHENTICATION_SUCCESS, listener)
    },

    onAuthFailure: (callback: (data: { message: string }) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, data: { message: string }) => {
        if (data && typeof data.message === 'string') {
          callback(data)
        } else {
          console.error('Invalid data received for AUTHENTICATION_FAILURE:', data)
        }
      }
      ipcRenderer.on(AppEvents.AUTHENTICATION_FAILURE, listener)
      return () => ipcRenderer.removeListener(AppEvents.AUTHENTICATION_FAILURE, listener)
    }
  }
} satisfies Window['api']

export default api
