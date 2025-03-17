import { ipcRenderer } from 'electron'
import { AppEvents } from '../main/events'

const api = {
  auth: {
    onAuthSuccess: (callback: (data: { refreshToken: string }) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, data: { refreshToken: string }) => {
        if (data && typeof data.refreshToken === 'string') {
          // console.log('Received refresh token in preload:', data.refreshToken)
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
  },
  window: {
    close: () => ipcRenderer.send('window:close'),
    openWebpage: (url) => ipcRenderer.send('open:webpage', url)
  },
  media: {
    getScreenStream: async () => {
      const sources = await ipcRenderer.invoke('get-sources')
      console.log('screen source:', sources)
      return sources
    },
    getScreenCapture: async (id: string) => {
      return await ipcRenderer.invoke('get-screen-capture', id)
    },
    sendMediaSources: async (sources) => ipcRenderer.send('media:sources', sources)
  },
  studio: {
    open: () => ipcRenderer.send('open:studio'),
    hidePluginWindow: (state: boolean) => {
      ipcRenderer.send('hide:plugin', { state })
    },
    onSourceReceived: (callback) => {
      const listener = (_event: Electron.IpcRendererEvent, profile) => {
        callback(profile)
      }
      ipcRenderer.on('profile:received', listener)
      return () => ipcRenderer.removeListener('profile:received', listener)
    },
    resize: (shrink) => {
      ipcRenderer.send('resize:studio', { shrink })
    }
  },
  webcam: {
    open: () => ipcRenderer.send('open:webcam'),
    onWebcamChange: (callback) => {
      const listener = (_event: Electron.IpcRendererEvent, webcam) => {
        callback(webcam)
      }
      ipcRenderer.on('webcam:onChange', listener)
      return () => ipcRenderer.removeListener('webcam:change', listener)
    },
    changeWebcam: (webcamId) => {
      if (webcamId) ipcRenderer.send('webcam:change', webcamId)
    }
  },
  liveStream: {
    startRtmpStream: (rtmpUrl: string) => ipcRenderer.invoke('start-rtmp-stream', { rtmpUrl }),
    sendVideoChunk: (chunk: Uint8Array) => ipcRenderer.invoke('send-video-chunk', chunk),
    stopRtmpStream: () => ipcRenderer.invoke('stop-rtmp-stream')
  }
} satisfies Window['api']

export default api
