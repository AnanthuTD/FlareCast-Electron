import { ipcMain, shell } from 'electron'
import { BrowserWindow } from 'electron/main'
import { AppEvents } from './events'

interface Props {
  studio: BrowserWindow
  mainWindow: BrowserWindow
  floatingWebCam: BrowserWindow
}

export function ipcEventHandlers({ studio, mainWindow, floatingWebCam }: Props) {
  ipcMain.on(AppEvents.OPEN_WEBPAGE, (_event, url) => {
    shell.openExternal(url || 'https://example.com')
  })

  ipcMain.on(AppEvents.RESIZE_STUDIO, (_event, payload) => {
    if (payload.shrink) {
      studio.setBounds({ width: 300, height: 100 })
    } else {
      studio.setBounds({ width: 300, height: 200 })
    }
  })

  ipcMain.on(AppEvents.HIDE_STUDIO_WINDOW, (_event, payload) => {
    if (payload.state === true) {
      studio.hide()
    } else {
      studio.show()
    }
  })

  ipcMain.on(AppEvents.WEBCAM_CHANGE, (_event, payload) => {
    floatingWebCam.webContents.send(AppEvents.WEBCAM_ON_CHANGE, payload)
  })

  ipcMain.handle(AppEvents.HIDE_WEBCAM, () => {
    floatingWebCam.hide()
  })

  ipcMain.handle(AppEvents.OPEN_WEBCAM, () => {
    floatingWebCam.show()
  })
}
