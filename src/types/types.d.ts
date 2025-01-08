import { ElectronAPI } from '@electron-toolkit/preload'

interface AuthApis {
  onAuthSuccess: (callback: (data: { refreshToken: string }) => void) => void
  onAuthFailure: (callback: ({ message: string }) => void) => void
}

interface WindowApis {
  close: () => void
  openWebpage: (url: string) => void
}

interface Sources {
  screen?: string
  audio?: string
  preset: 'HD' | 'SD'
  plan: 'PRO' | 'FREE'
  id: string
}

interface MediaApis {
  getScreenStream: () => Promise<{ deviceId: string; label: string; thumbnail: string }[]>
  getScreenCapture: (id: string) => Promise<any>
  sendMediaSources: (sources: Sources) => Promise<void>
}

interface StudioApis {
  hidePluginWindow: (state: boolean) => void
  onSourceReceived: (callback: (profile: Sources) => void) => void
  resize: (shrink: boolean) => void
}

interface WebcamApis {
  changeWebcam: (webcamId: string | undefined) => void
  onWebcamChange: (callback: (webcamId: string) => void) => () => Electron.IpcRenderer
}

interface ApiTypes {
  auth: AuthApis
  window: WindowApis
  media: MediaApis
  studio: StudioApis
  webcam: WebcamApis
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ApiTypes
  }
}
