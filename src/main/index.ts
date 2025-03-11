import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { handleDeepLink } from './handleDeepLink'
import { handleRendererEvents } from './handleRendererEvents'
import handleMediaEvents from './handleMediaEvents'

const PROTOCOL_NAME = 'flarecast'

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL_NAME, process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL_NAME)
}

let mainWindow: BrowserWindow
let studio: BrowserWindow
let floatingWebCam: BrowserWindow

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
    handleDeepLink(mainWindow, new URL(Url))
  })

  app.whenReady().then(() => {
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
    dialog.showErrorBox('Welcome Back', `You arrived from: ${url}, ${params}`)
    handleDeepLink(mainWindow, new URL(url))
  })
}

function createWindow(): void {
  console.log('__dirname: ', __dirname)
  console.log("process.env['ELECTRON_RENDERER_URL'] ", process.env['ELECTRON_RENDERER_URL'])
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 350,
    height: 400,
    minHeight: 400,
    minWidth: 300,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    // resizable: true,
    // focusable: false
    // icon: path.join(process.env['ELECTRON_RENDERER_URL'], 'flarecast.svg')
  })

  // mainWindow.webContents.openDevTools()
  mainWindow.setContentProtection(true)

  studio = new BrowserWindow({
    width: 300,
    height: 50,
    minHeight: 50,
    minWidth: 300,
    maxHeight: 400,
    maxWidth: 400,
    frame: false,
    alwaysOnTop: true,
    // focusable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    },
    transparent: true,
    skipTaskbar: true
  })

  // studio.webContents.openDevTools()
  studio.setContentProtection(true)
  // studio.setIgnoreMouseEvents(true, { forward: true });

  floatingWebCam = new BrowserWindow({
    width: 200,
    height: 200,
    minHeight: 100,
    minWidth: 100,
    maxHeight: 400,
    maxWidth: 400,
    frame: false,
    alwaysOnTop: true,
    // focusable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    },
    transparent: true,
    skipTaskbar: true
  })

  // floatingWebCam.setContentProtection(true)

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
    studio.loadFile(join(__dirname, '../renderer/webcam.html'))
  }

  handleRendererEvents(mainWindow)
  handleMediaEvents(mainWindow)
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
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

ipcMain.on('media:sources', (_event, payload) => {
  try {
    studio.webContents.send('profile:received', payload)
  } catch (error) {
    console.log('failed to send profile')
  }
})

ipcMain.on('resize:studio', (_event, payload) => {
  // const { x, y } = studio.getBounds() // Get the current position of the window
  // const heightDifference = 50 // Difference in height between the two states (200 - 100)

  if (payload.shrink) {
    studio.setBounds({
      // x, // Keep the X position unchanged
      // y: y+heightDifference, // Move the window down by the height difference
      width: 300,
      height: 100
    })
  } else {
    studio.setBounds({
      // x, // Keep the X position unchanged
      // y: y-heightDifference,
      width: 300,
      height: 200
    })
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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
app.disableHardwareAcceleration()
