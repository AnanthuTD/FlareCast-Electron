import { ipcRenderer } from 'electron'
import { AppEvents } from '../main/events'
import { PresetSetCallbackProps } from '../types/types'
import { User } from '../renderer/src/types/types'

const api = {
  auth: {
    onAuthSuccess: (callback: (data: { user: User }) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, data: { user: User }) => {
        console.log('Auth success event received')
        if (data) {
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
        console.info('Auth failure event received')
        if (data && typeof data.message === 'string') {
          callback(data)
        } else {
          console.error('Invalid data received for AUTHENTICATION_FAILURE:', data)
        }
      }
      ipcRenderer.on(AppEvents.AUTHENTICATION_FAILURE, listener)
      return () => ipcRenderer.removeListener(AppEvents.AUTHENTICATION_FAILURE, listener)
    },

    getAccessToken: async () => {
      console.log('Getting access token')
      const accessToken = await ipcRenderer.invoke(AppEvents.GET_ACCESS_TOKEN)
      return accessToken as string
    },

    getRefreshToken: async () => {
      const refreshToken = await ipcRenderer.invoke(AppEvents.GET_REFRESH_TOKEN)
      return refreshToken as string
    },

    storeTokens: (accessToken?: string, refreshToken?: string) => {
      ipcRenderer.invoke(AppEvents.STORE_TOKENS, { accessToken, refreshToken })
    },

    clearTokens: () => {
      ipcRenderer.invoke(AppEvents.CLEAR_TOKENS)
    },

    handleUnauthorized: async (): Promise<boolean> => {
      return await ipcRenderer.invoke(AppEvents.HANDLE_UNAUTHORIZED)
    },

    handleAuthorized: async (): Promise<boolean> => {
      return await ipcRenderer.invoke(AppEvents.HANDLE_AUTHORIZED)
    },

    handleLogout: async (): Promise<boolean> => {
      return await ipcRenderer.invoke(AppEvents.HANDLE_LOGOUT)
    }
  },
  window: {
    close: () => ipcRenderer.send(AppEvents.WINDOW_CLOSE),
    openWebpage: (url) => ipcRenderer.send(AppEvents.OPEN_WEBPAGE, url)
  },
  media: {
    getScreenStream: async () => {
      const sources = await ipcRenderer.invoke(AppEvents.GET_SOURCES)
      return sources
    },
    getScreenCapture: async (id: string) => {
      return await ipcRenderer.invoke(AppEvents.GET_SCREEN_CAPTURE, id)
    },
    sendMediaSources: async (sources) => ipcRenderer.send(AppEvents.SEND_MEDIA_SOURCES, sources)
  },
  studio: {
    open: () => ipcRenderer.send(AppEvents.OPEN_STUDIO),
    hidePluginWindow: (state: boolean) => {
      ipcRenderer.send(AppEvents.HIDE_STUDIO_WINDOW, { state })
    },
    onSourceReceived: (callback) => {
      const listener = (_event: Electron.IpcRendererEvent, profile) => {
        callback(profile)
      }
      ipcRenderer.on(AppEvents.PROFILE_RECEIVED, listener)
      return () => ipcRenderer.removeListener(AppEvents.PROFILE_RECEIVED, listener)
    },
    resize: (shrink) => {
      ipcRenderer.send(AppEvents.RESIZE_STUDIO, { shrink })
    }
  },
  webcam: {
    open: () => ipcRenderer.send(AppEvents.OPEN_WEBCAM),
    onWebcamChange: (callback) => {
      const listener = (_event: Electron.IpcRendererEvent, webcam) => {
        callback(webcam)
      }
      ipcRenderer.on(AppEvents.WEBCAM_ON_CHANGE, listener)
      return () => ipcRenderer.removeListener(AppEvents.WEBCAM_ON_CHANGE, listener)
    },
    changeWebcam: (webcamId) => {
      if (webcamId) ipcRenderer.send(AppEvents.WEBCAM_CHANGE, webcamId)
    }
  },
  liveStream: {
    startRtmpStream: (rtmpUrl: string) => ipcRenderer.invoke(AppEvents.START_STREAM, { rtmpUrl }),
    sendVideoChunk: (chunk: Uint8Array) => ipcRenderer.invoke(AppEvents.SEND_VIDEO_CHUNK, chunk),
    stopRtmpStream: () => ipcRenderer.invoke(AppEvents.STOP_STREAM)
  },
  preset: {
    set: (callback: (data: PresetSetCallbackProps) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, data: PresetSetCallbackProps) => {
        if (data) {
          callback(data)
        } else {
          console.error('Data not received from deeplink invocation', data)
        }
      }
      ipcRenderer.on(AppEvents.SET_PRESET, listener)
      return () => ipcRenderer.removeListener(AppEvents.SET_PRESET, listener)
    }
  }
} satisfies Window['api']

export default api
