import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

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
  const accessToken = await window.api.auth.getAccessToken()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
    console.log('Setting Authorization header:', accessToken)
  }
  return config
})

// Public instance doesn’t need token by default, but can be added if required
publicAxiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await window.api.auth.getAccessToken()
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
        const isRefreshed = await window.api.auth.handleUnauthorized()
        if (!isRefreshed) throw new Error('Failed to refresh token')

        onTokenRefreshed()

        const newAccessToken = await window.api.auth.getAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        console.log('🔴 Token refresh failed:', refreshError)
        await window.api.auth.clearTokens()
        if (!['/signin', '/signup'].includes(window.location.pathname)) {
          window.api.auth.handleLogout()
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
