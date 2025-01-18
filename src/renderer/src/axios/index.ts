import { useUserStore } from '@renderer/stores/userStore'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const config: AxiosRequestConfig = {
  // baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420'
  },
  withCredentials: true
}

const axiosInstance: AxiosInstance = axios.create(config)
const userStore = useUserStore

// TODO: Remove this on production
document.cookie =
  'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5NTFkMGE0LTYxYzItNDUyZS1hYmZkLTljZGI5Y2U3NWM2MiIsImlhdCI6MTczNzE3Mjk1NiwiZXhwIjoxNzM5NzY0OTU2fQ.fjtu4P-iL-L3PWwo7ZYUjx5zJKxrbkKc5Hq34RCh4f8;'

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = userStore.getState().accessToken // Access token from Zustand

    console.log('============================================')
    console.log('accessToken:', accessToken)
    console.log('============================================')

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle responses and errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config

      // Optional: Handle token refresh logic here if applicable
      if (!originalRequest._retry) {
        originalRequest._retry = true
        try {
          const response = await axios.get('/api/user/auth/refresh-token')
          const newAccessToken = response.data.accessToken

          userStore.getState().setAccessToken(newAccessToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

          return axiosInstance(originalRequest) // Retry the original request
        } catch (refreshError) {
          userStore.getState().clearAccessToken() // Clear token if refresh fails
          if (!['/signin', 'signup'].includes(window.location.pathname)) {
            window.location.href = '/signin'
          }
          return Promise.reject(refreshError)
        }
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
