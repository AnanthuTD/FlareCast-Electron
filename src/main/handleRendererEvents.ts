import fs from 'fs'
import path from 'path'
import { app, ipcMain, shell, safeStorage } from 'electron'

export function handleRendererEvents() {
  ipcMain.on('open:webpage', (_event, url) => {
    shell.openExternal(url || 'https://example.com')
  })

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
  ipcMain.handle('store-tokens', async (event, tokens: Tokens) => {
    ensureTokenFile()
    const encryptedAccess = safeStorage.encryptString(tokens.accessToken)
    const encryptedRefresh = safeStorage.encryptString(tokens.refreshToken)
    fs.writeFileSync(
      tokenFile,
      JSON.stringify({ access: encryptedAccess, refresh: encryptedRefresh })
    )
  })

  // Get access token
  ipcMain.handle('get-access-token', async () => {
    ensureTokenFile()
    const tokens = JSON.parse(fs.readFileSync(tokenFile, 'utf-8'))
    if (!tokens.access) return null
    return safeStorage.decryptString(Buffer.from(tokens.access))
  })

  // Get refresh token
  ipcMain.handle('get-refresh-token', async () => {
    ensureTokenFile()
    const tokens = JSON.parse(fs.readFileSync(tokenFile, 'utf-8'))
    if (!tokens.refresh) return null
    return safeStorage.decryptString(Buffer.from(tokens.refresh))
  })

  // Clear tokens
  ipcMain.handle('clear-tokens', async () => {
    fs.writeFileSync(tokenFile, JSON.stringify({ access: '', refresh: '' }))
  })
}
