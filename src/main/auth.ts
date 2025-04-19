import { apiRequest } from '../renderer/src/api/api'
import { publicAxiosInstance, storeTokens } from './handleTokenRefresh'
import { AppEvents } from './events'

interface TokenResponse {
  accessToken: string
  refreshToken: string
}

interface LoginResponse extends TokenResponse {
  user: any
}

export async function loginWithRefreshToken(refreshToken: string, mainWindow) {
  const result = await postLogin(refreshToken)
  if (!result) return null
  const { user, accessToken, refreshToken: newRefreshToken } = result
  mainWindow.webContents.send(AppEvents.AUTHENTICATION_SUCCESS, { user })
  storeTokens({ access: accessToken, refresh: newRefreshToken })
  return user
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

  console.log('Refresh success: ', result.data)
  return result.data // { accessToken, refreshToken }
}

// Logout (optional, if server-side logout is needed)
export async function logoutRequest(): Promise<void> {
  await publicAxiosInstance.post(`/users/auth/logout`)
}
