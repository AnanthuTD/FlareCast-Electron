import { ElectronAPI } from '@electron-toolkit/preload'
import { SubscriptionPlan, User } from '../renderer/src/types/types'

interface AuthApis {
  onAuthSuccess: (callback: (data: { user: User }) => void) => void
  onAuthFailure: (callback: ({ message: string }) => void) => void
  getAccessToken: () => Promise<string>
  getRefreshToken: () => Promise<string>
  storeTokens: (accessToken?: string, refreshToken?: string) => void
  clearTokens: () => void
  handleUnauthorized: () => Promise<boolean>
  handleAuthorized: () => Promise<boolean>
  handleLogout: () => Promise<boolean>
}

interface WindowApis {
  close: () => void
  openWebpage: (url: string) => void
}

interface Sources {
  screen?: string
  audio?: string
  plan: SubscriptionPlan
  id: string
}

interface MediaApis {
  getScreenStream: () => Promise<{ deviceId: string; label: string; thumbnail: string }[]>
  getScreenCapture: (id: string) => Promise<any>
  sendMediaSources: (sources: Sources) => Promise<void>
}

interface StudioApis {
  open: () => void
  hidePluginWindow: (state: boolean) => void
  onSourceReceived: (callback: (profile: Sources) => void) => () => void
  resize: (shrink: boolean) => void
}

interface WebcamApis {
  open: () => void
  changeWebcam: (webcamId: string | undefined) => void
  onWebcamChange: (callback: (webcamId: string) => void) => () => Electron.IpcRenderer
}

interface LiveStreamApis {
  startRtmpStream: (rtmpUrl: string) => Promise<any>
  stopRtmpStream: () => Promise<any>
  sendVideoChunk: (chunk: Uint8Array) => Promise<any>
}

interface PresetSetCallbackProps {
  workspaceId: string
  folderId: string
  spaceId: string
}
interface Preset {
  set: (callback: (data: PresetSetCallbackProps) => void) => () => void
}

interface ApiTypes {
  auth: AuthApis
  window: WindowApis
  media: MediaApis
  studio: StudioApis
  webcam: WebcamApis
  liveStream: LiveStreamApis
  preset: Preset
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ApiTypes
  }
}
