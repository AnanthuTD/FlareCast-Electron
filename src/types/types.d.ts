import { ElectronAPI } from '@electron-toolkit/preload'

interface AuthApis {
  onAuthSuccess: (callback: (data: { refreshToken: string }) => void) => void
  onAuthFailure: (callback: ({ message: string }) => void) => void
}

interface ApiTypes {
  auth: AuthApis
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ApiTypes
  }
}
