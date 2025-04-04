import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

console.log(import.meta.env.DEV, import.meta.env.VITE_API_GATEWAY_URL)

const config: AxiosRequestConfig = {
  baseURL: import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_GATEWAY_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420'
  },
  withCredentials: true
}

const axiosInstance: AxiosInstance = axios.create(config)
export const publicAxiosInstance: AxiosInstance = axios.create(config)

let isRefreshing = false
let refreshSubscribers: (() => void)[] = []

const onTokenRefreshed = () => {
  refreshSubscribers.forEach((callback) => callback())
  refreshSubscribers = []
}

const addRefreshSubscriber = (callback: () => void) => {
  refreshSubscribers.push(callback)
}

// Add request interceptor to include accessToken
axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await window.electron.ipcRenderer.invoke('get-access-token')
  const refreshToken = await window.electron.ipcRenderer.invoke('get-refresh-token')
  console.log(accessToken, refreshToken)

  // Set cookies via IPC
  await window.electron.ipcRenderer.invoke('set-cookie', {
    name: 'accessToken',
    value: accessToken
  })
  await window.electron.ipcRenderer.invoke('set-cookie', {
    name: 'refreshToken',
    value: refreshToken
  })

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
    console.log('Setting Authorization header:', accessToken)
  }
  return config
})

publicAxiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await window.electron.ipcRenderer.invoke('get-access-token')
  const refreshToken = await window.electron.ipcRenderer.invoke('get-refresh-token')
  console.log(accessToken, refreshToken)

  // Set cookies via IPC
  await window.electron.ipcRenderer.invoke('set-cookie', {
    name: 'accessToken',
    value: accessToken
  })
  await window.electron.ipcRenderer.invoke('set-cookie', {
    name: 'refreshToken',
    value: refreshToken
  })

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
    console.log('Setting Authorization header:', accessToken)
  }
  return config
})
// Response interceptor for token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber(() => {
            resolve(axiosInstance(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = await window.electron.ipcRenderer.invoke('get-refresh-token')
        if (!refreshToken) throw new Error('No refresh token available')

        const { data } = await publicAxiosInstance.post(`/user/api/auth/refresh-token`, {
          refreshToken
        })
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data // Expect new tokens

        // Store new tokens
        await window.electron.ipcRenderer.invoke('store-tokens', {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || refreshToken // Use new refreshToken if provided, else keep old one
        })

        onTokenRefreshed()
      } catch (refreshError) {
        console.log('🔴 Token refresh failed:', refreshError)
        // await window.electron.ipcRenderer.invoke('clear-tokens')
        if (!['/signin', '/signup'].includes(window.location.pathname)) {
          // window.location.href = '/signin'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }

      return axiosInstance(originalRequest)
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
