/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SIGNIN_URL: string
  readonly VITE_SIGNUP_URL: string
  readonly VITE_APP_URL: string
  readonly VITE_SOCKET_URL: string
  readonly VITE_USER_SERVICE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
