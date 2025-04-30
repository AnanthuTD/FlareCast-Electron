import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import winIcon from '../../resources/icons/win/icon.ico?asset'
import macIcon from '../../resources/icons/mac/icon.icns?asset'
import linuxIcon from '../../resources/icons/png/512x512.png?asset'
import { handleDeepLink } from './handleDeepLink'
import { ipcAuthEventHandlers } from './ipcAuthEventHandlers'
import { handleRtmpStream } from './handlertmpStreamer'
import { AppEvents } from './events'
import { ipcEventHandlers } from './ipcEventHandlers'
import ipcMediaEventHandlers from './ipcMediaEventHandlers'

const PROTOCOL_NAME = 'flarecast'

let mainWindow: BrowserWindow
let studioWindow: BrowserWindow
let webcamWindow: BrowserWindow

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL_NAME, process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL_NAME)
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    const Url = commandLine.pop() as string
    handleDeepLink(mainWindow, studioWindow, new URL(Url))
  })

  app.whenReady().then(async () => {
    try {
      electronApp.setAppUserModelId('com.electron')

      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
      })

      createWindow()

      app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
    } catch (error) {
      console.error('Error initializing app:', error)
    }
  })

  app.on('open-url', (event, url) => {
    event.preventDefault()
    dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
    handleDeepLink(mainWindow, studioWindow, new URL(url))
  })
}

function getIconPath() {
  if (process.platform === 'win32') {
    return winIcon
  } else if (process.platform === 'darwin') {
    return macIcon
  } else {
    return linuxIcon
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 350,
    height: 400,
    minHeight: 400,
    minWidth: 300,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    icon: getIconPath()
  })

  if (is.dev) mainWindow.webContents.openDevTools()

  studioWindow = new BrowserWindow({
    width: 300,
    height: 50,
    minHeight: 50,
    minWidth: 300,
    maxHeight: 400,
    maxWidth: 400,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    },
    transparent: true,
    skipTaskbar: true,
    icon: getIconPath()
  })

  if (is.dev) studioWindow.webContents.openDevTools()

  webcamWindow = new BrowserWindow({
    width: 200,
    height: 200,
    minHeight: 100,
    minWidth: 100,
    maxHeight: 400,
    maxWidth: 400,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true,
      nodeIntegration: true
    },
    transparent: true,
    skipTaskbar: true,
    icon: getIconPath()
  })

  mainWindow.visibleOnAllWorkspaces = true
  studioWindow.visibleOnAllWorkspaces = true
  webcamWindow.visibleOnAllWorkspaces = true

  mainWindow.setAlwaysOnTop(true, 'screen-saver', 1)
  studioWindow.setAlwaysOnTop(true, 'screen-saver', 1)
  webcamWindow.setAlwaysOnTop(true, 'screen-saver', 1)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  studioWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    studioWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/studio.html`)
    webcamWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/webcam.html`)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    studioWindow.loadFile(join(__dirname, '../renderer/studio.html'))
    webcamWindow.loadFile(join(__dirname, '../renderer/webcam.html'))
  }

  ipcAuthEventHandlers({ mainWindow, studioWindow, webcamWindow })
  ipcMediaEventHandlers({ studio: studioWindow })
  ipcEventHandlers({ floatingWebCam: webcamWindow, mainWindow, studio: studioWindow })
  handleRtmpStream()
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on(AppEvents.WINDOW_CLOSE, () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.disableHardwareAcceleration()
