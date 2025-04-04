import axiosInstance, { publicAxiosInstance } from '../axios/index'
import { AxiosResponse, AxiosError } from 'axios'

interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export async function apiRequest<T>(request: Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> {
  try {
    const response = await request
    return { data: response.data, error: null }
  } catch (error) {
    const axiosError = error as AxiosError
    const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Unknown error'
    console.error('API request failed:', errorMessage)
    return { data: null, error: errorMessage }
  }
}

export async function postLogin(refreshToken: string) {
  const result = await apiRequest(
    publicAxiosInstance.post(`/user/api/auth/post-login`, { refreshToken })
  )
  if (result.error) {
    return null
  }

  const { user, accessToken, refreshToken: newRefreshToken } = result.data // Extract both tokens
  if (accessToken && newRefreshToken) {
    // Send both tokens to main process
    await window.electron.ipcRenderer.invoke('store-tokens', {
      accessToken,
      refreshToken: newRefreshToken
    })
  }
  return user
}

export async function canRecord(): Promise<boolean> {
  const result = await apiRequest(axiosInstance.get(`/user/api/limits/upload-permission`))
  if (result.error) {
    return false
  }
  return result.data.permission === 'granted'
}

export async function getStreamToken(props?: {
  workspaceId: string
  folderId: string
  spaceId: string
}): Promise<{ token; streamKey } | null> {
  const { data } = await axiosInstance.get(`/video/api/stream-key`, { params: props })
  return data
}

export async function checkAuthentication() {
  const { data } = await axiosInstance.get(`/user/api/profile`)
  return data
}

export async function logout() {
  await window.electron.ipcRenderer.invoke('clear-tokens')
  window.location.href = '/signin'
}
