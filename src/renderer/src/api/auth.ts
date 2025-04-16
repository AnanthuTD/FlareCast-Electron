import { User } from '../types/types'
import { apiRequest } from './api'
import { publicAxiosInstance } from './axios/index'

interface TokenResponse {
  accessToken: string
  refreshToken: string
}

interface LoginResponse extends TokenResponse {
  user: User
}

// Login with refresh token
export async function postLogin(refreshToken: string): Promise<LoginResponse | null> {
  const result = await apiRequest<LoginResponse>(
    publicAxiosInstance.post(`/users/auth/post-login`, { refreshToken })
  )
  if (result.error) {
    console.error('Login failed:', result.error)
    return null
  }
  return result.data // { user, accessToken, refreshToken }
}

// Refresh token request
export async function refreshAccessToken(refreshToken?: string): Promise<TokenResponse | null> {
  const result = await apiRequest<TokenResponse>(
    publicAxiosInstance.post(`/users/auth/refresh-token`, { refreshToken })
  )
  if (result.error) {
    console.error('Token refresh failed:', result.error)
    return null
  }
  return result.data // { accessToken, refreshToken }
}

// Logout (optional, if server-side logout is needed)
export async function logoutRequest(): Promise<void> {
  await publicAxiosInstance.post(`/users/auth/logout`)
}
