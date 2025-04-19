import fs from 'fs'
import path from 'path'
import { app, ipcMain, safeStorage } from 'electron'
import { BrowserWindow } from 'electron/main'
import { AppEvents } from './events'
import { handleLogout, handleTokenRefresh } from './handleTokenRefresh'

interface Props {
  studioWindow: BrowserWindow
  mainWindow: BrowserWindow
  webcamWindow: BrowserWindow
}

export function ipcAuthEventHandlers({ mainWindow, studioWindow, webcamWindow }: Props) {
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

  ipcMain.handle(AppEvents.HANDLE_UNAUTHORIZED, async (_event, payload) => {
    console.log('Handling unauthorized!')
    try {
      await handleTokenRefresh()
      return true
    } catch (error) {
      console.error('🔴 Error: ', error)

      // Only hide windows to reuse later
      if (studioWindow && !studioWindow.isDestroyed()) studioWindow.hide()
      if (webcamWindow && !webcamWindow.isDestroyed()) webcamWindow.hide()

      ipcMain.emit(AppEvents.AUTHENTICATION_FAILURE, { message: 'Failed to refresh token!' })
      return false
    }
  })

  ipcMain.handle(AppEvents.HANDLE_AUTHORIZED, (_event, payload) => {
    // Recreate windows if destroyed
    if (!studioWindow || studioWindow.isDestroyed()) {
      console.error('No studio window present!')
    }
    if (!webcamWindow || webcamWindow.isDestroyed()) {
      console.error('No studio window present!')
    }
    // Show windows
    studioWindow.show()
    webcamWindow.show()
  })

  ipcMain.handle(AppEvents.HANDLE_LOGOUT, () => {
    handleLogout()
    if (studioWindow && !studioWindow.isDestroyed()) studioWindow.hide()
    if (webcamWindow && !webcamWindow.isDestroyed()) webcamWindow.hide()
    mainWindow.webContents.send(AppEvents.AUTHENTICATION_FAILURE, { message: 'Logged out' })
  })
}
