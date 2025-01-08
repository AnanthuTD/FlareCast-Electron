import { app, BrowserWindow, ipcMain, shell } from 'electron'

export function handleRendererEvents(mainWindow: BrowserWindow) {
  /* ipcMain.on('window:close', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.close()
  }) */

  ipcMain.on('open:webpage', (_event, url) => {
    shell.openExternal(url || 'https://example.com')
  })
}
