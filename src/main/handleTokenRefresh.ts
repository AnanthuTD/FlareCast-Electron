import { app, safeStorage } from 'electron'
import { logoutRequest, refreshAccessToken } from './auth'
import fs from 'node:fs'
import path from 'node:path'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const config: AxiosRequestConfig = {
  baseURL: process.env.DEV ? '/api' : import.meta.env.VITE_API_GATEWAY_URL + '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420'
  },
  withCredentials: true
}

export const publicAxiosInstance: AxiosInstance = axios.create(config)

const tokenFile = path.join(app.getPath('userData'), 'tokens.json')

// Get access token
const getAccessToken = async () => {
  ensureTokenFile()
  const tokens = JSON.parse(fs.readFileSync(tokenFile, 'utf-8'))
  if (!tokens.access) return null
  const accessToken = safeStorage.decryptString(Buffer.from(tokens.access))
  console.log('accessToken: ', accessToken)
  return accessToken
}

publicAxiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
    console.log('Setting Authorization header:', accessToken)
  }
  return config
})


export const ensureTokenFile = () => {
  if (!fs.existsSync(tokenFile)) {
    fs.writeFileSync(tokenFile, JSON.stringify({ access: '', refresh: '' }))
  }
}

// Get refresh token
const getRefreshToken = async () => {
  ensureTokenFile()
  const tokens = JSON.parse(fs.readFileSync(tokenFile, 'utf-8'))
  if (!tokens.refresh) return null
  const refreshToken = safeStorage.decryptString(Buffer.from(tokens.refresh))
  console.log('refreshToken: ', refreshToken)
  return refreshToken
}

export const storeTokens = ({ access, refresh }) => {
  // Store new tokens via IPC
  ensureTokenFile()
  const encryptedAccess = safeStorage.encryptString(access ?? '')
  const encryptedRefresh = safeStorage.encryptString(refresh ?? '')
  fs.writeFileSync(
    tokenFile,
    JSON.stringify({ access: encryptedAccess, refresh: encryptedRefresh })
  )
}

export async function handleTokenRefresh() {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token available')

  const newTokens = await refreshAccessToken(refreshToken)
  if (!newTokens) {
    storeTokens({ access: '', refresh: '' })
    throw new Error('Refresh token invalid')
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = newTokens

  storeTokens({ access: newAccessToken, refresh: newRefreshToken })
}

export async function handleLogout() {
  try {
    await logoutRequest()
  } catch (e) {
    console.error('Failed to logout: ', e)
  } finally {
    fs.writeFileSync(tokenFile, JSON.stringify({ access: '', refresh: '' }))
  }
}
