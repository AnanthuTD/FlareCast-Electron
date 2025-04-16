import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { refreshAccessToken } from '../auth'

const config: AxiosRequestConfig = {
  baseURL: import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_GATEWAY_URL + '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420'
  },
  withCredentials: true
}

export const axiosInstance: AxiosInstance = axios.create(config)
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

// Request interceptor to add access token
axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await window.electron.ipcRenderer.invoke('get-access-token')
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
    console.log('Setting Authorization header:', accessToken)
  }
  return config
})

// Public instance doesn’t need token by default, but can be added if required
publicAxiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await window.electron.ipcRenderer.invoke('get-access-token')
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
        // const refreshToken = await window.electron.ipcRenderer.invoke('get-refresh-token')
        // if (!refreshToken) throw new Error('No refresh token available')

        const newTokens = await refreshAccessToken()
        if (!newTokens) throw new Error('Refresh token invalid')

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = newTokens

        // Store new tokens via IPC
        await window.electron.ipcRenderer.invoke('store-tokens', {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        })

        onTokenRefreshed()
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        console.log('🔴 Token refresh failed:', refreshError)
        await window.electron.ipcRenderer.invoke('clear-tokens')
        if (!['/signin', '/signup'].includes(window.location.pathname)) {
          window.location.href = '/signin'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
