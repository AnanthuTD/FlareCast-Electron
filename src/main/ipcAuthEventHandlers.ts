import fs from 'fs'
import path from 'path'
import { app, ipcMain, safeStorage } from 'electron'
import { AppEvents } from './events'

export function ipcAuthEventHandlers() {
  const tokenFile = path.join(app.getPath('userData'), 'tokens.json')

  interface Tokens {
    accessToken: string
    refreshToken: string
  }

  // Ensure token file exists
  const ensureTokenFile = () => {
    if (!fs.existsSync(tokenFile)) {
      fs.writeFileSync(tokenFile, JSON.stringify({ access: '', refresh: '' }))
    }
  }

  // Store tokens
  ipcMain.handle(AppEvents.STORE_TOKENS, async (event, tokens: Tokens) => {
    ensureTokenFile()
    const encryptedAccess = safeStorage.encryptString(tokens.accessToken ?? '')
    const encryptedRefresh = safeStorage.encryptString(tokens.refreshToken ?? '')
    fs.writeFileSync(
      tokenFile,
      JSON.stringify({ access: encryptedAccess, refresh: encryptedRefresh })
    )
  })

  // Get access token
  ipcMain.handle(AppEvents.GET_ACCESS_TOKEN, async () => {
    ensureTokenFile()
    const tokens = JSON.parse(fs.readFileSync(tokenFile, 'utf-8'))
    if (!tokens.access) return null
    const accessToken = safeStorage.decryptString(Buffer.from(tokens.access))
    console.log('accessToken: ', accessToken)
    return accessToken
  })

  // Get refresh token
  ipcMain.handle(AppEvents.GET_REFRESH_TOKEN, async () => {
    ensureTokenFile()
    const tokens = JSON.parse(fs.readFileSync(tokenFile, 'utf-8'))
    if (!tokens.refresh) return null
    const refreshToken = safeStorage.decryptString(Buffer.from(tokens.refresh))
    console.log('refreshToken: ', refreshToken)
    return refreshToken
  })

  // Clear tokens
  ipcMain.handle(AppEvents.CLEAR_TOKENS, async () => {
    fs.writeFileSync(tokenFile, JSON.stringify({ access: '', refresh: '' }))
  })
}
