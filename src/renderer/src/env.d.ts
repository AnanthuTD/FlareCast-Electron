/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_DEV_AUTH_URL: string
  readonly VITE_PRO_AUTH_URL: string
  readonly VITE_APP_URL: string
  readonly VITE_SOCKET_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
