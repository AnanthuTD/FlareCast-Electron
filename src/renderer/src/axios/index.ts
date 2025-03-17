import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const config: AxiosRequestConfig = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420'
  },
  withCredentials: true
}

const axiosInstance: AxiosInstance = axios.create(config)

let isRefreshing = false
let refreshSubscribers: (() => void)[] = []

// Function to call all subscribers
const onTokenRefreshed = () => {
  refreshSubscribers.forEach((callback) => callback())
  refreshSubscribers = []
}

const addRefreshSubscriber = (callback: () => void) => {
  refreshSubscribers.push(callback)
}

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the new token if refresh is in progress
        return new Promise((resolve) => {
          addRefreshSubscriber(() => {
            resolve(axiosInstance(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await axios.get(`/api/user/auth/refresh-token`)

        onTokenRefreshed()
      } catch (refreshError) {
        if (!['/signin', '/signup'].includes(window.location.pathname)) {
          window.location.href = '/signin'
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
