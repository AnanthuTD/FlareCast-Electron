import axiosInstance from './axios/index'
import { AxiosResponse } from 'axios'
import { postLogin } from './auth'

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export async function apiRequest<T>(request: Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> {
  try {
    const response = await request
    return { data: response.data, error: null }
  } catch (error) {
    const axiosError = error as any
    const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Unknown error'
    console.error('API request failed:', errorMessage)
    return { data: null, error: errorMessage }
  }
}

// Updated postLogin to return full response
export async function loginWithRefreshToken(refreshToken: string) {
  const result = await postLogin(refreshToken)
  if (!result) return null
  const { user, accessToken, refreshToken: newRefreshToken } = result
  window.api.auth.storeTokens(accessToken, newRefreshToken)
  return user
}

export async function canRecord(): Promise<boolean> {
  const result = await apiRequest(axiosInstance.get(`/users/limits/upload-permission`))
  if (result.error) return false
  return result.data.permission === 'granted'
}

export async function getStreamToken(props?: {
  workspaceId: string
  folderId: string
  spaceId: string
}): Promise<{ token: string; streamKey: string } | null> {
  const { data } = await axiosInstance.get(`/videos/stream-key`, { params: props })
  return data
}

export async function checkAuthentication() {
  const { data } = await axiosInstance.get(`/users/profile`)
  return data
}

export async function logout() {
  window.api.auth.clearTokens()
  window.location.href = '/signin'
}
