import { app, shell, BrowserWindow, ipcMain, dialog, session } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import winIcon from '../../resources/icons/win/icon.ico?asset'
import macIcon from '../../resources/icons/mac/icon.icns?asset'
import linuxIcon from '../../resources/icons/png/512x512.png?asset'
import { handleDeepLink } from './handleDeepLink'
import { handleRendererEvents } from './handleRendererEvents'
import handleMediaEvents from './handleMediaEvents'
import { setupRtmpStreaming } from './handlertmpStreamer'

const PROTOCOL_NAME = 'flarecast'

let mainWindow: BrowserWindow
let studio: BrowserWindow
let floatingWebCam: BrowserWindow
let store // Declare store for electron-store

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
    handleDeepLink(mainWindow, studio, new URL(Url))
  })

  app.whenReady().then(async () => {
    try {
      // Dynamically import electron-store to handle ESM in CommonJS
      const { default: Store } = await import('electron-store')
      store = new Store()

      electronApp.setAppUserModelId('com.electron')

      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
      })

      setupRtmpStreaming()

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
    handleDeepLink(mainWindow, studio, new URL(url))
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

  studio = new BrowserWindow({
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

  if (is.dev) studio.webContents.openDevTools()

  floatingWebCam = new BrowserWindow({
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
  studio.visibleOnAllWorkspaces = true
  floatingWebCam.visibleOnAllWorkspaces = true

  mainWindow.setAlwaysOnTop(true, 'screen-saver', 1)
  studio.setAlwaysOnTop(true, 'screen-saver', 1)
  floatingWebCam.setAlwaysOnTop(true, 'screen-saver', 1)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  studio.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    studio.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/studio.html`)
    floatingWebCam.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/webcam.html`)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    studio.loadFile(join(__dirname, '../renderer/studio.html'))
    floatingWebCam.loadFile(join(__dirname, '../renderer/webcam.html'))
  }

  handleRendererEvents()
  handleMediaEvents(mainWindow)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('window:close', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Existing IPC handlers
ipcMain.on('media:sources', (_event, payload) => {
  try {
    studio.webContents.send('profile:received', payload)
  } catch (error) {
    console.log('failed to send profile')
  }
})

ipcMain.on('resize:studio', (_event, payload) => {
  if (payload.shrink) {
    studio.setBounds({ width: 300, height: 100 })
  } else {
    studio.setBounds({ width: 300, height: 200 })
  }
})

ipcMain.on('hide:plugin', (_event, payload) => {
  console.log(payload)
  mainWindow.webContents.send('hide:plugin', payload)
})

ipcMain.on('webcam:change', (_event, payload) => {
  console.log('webcam:change', payload)
  floatingWebCam.webContents.send('webcam:onChange', payload)
})

app.disableHardwareAcceleration()
