import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { handleDeepLink } from './handleDeepLink'
import { handleRendererEvents } from './handleRendererEvents'
import handleMediaEvents from './handleMediaEvents'

const PROTOCOL_NAME = 'flarecast'

console.log('================================================================')
console.log('flarecast://auth/success?refreshToken=asdfsfdadf')
console.log('================================================================')

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
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    const Url = commandLine.pop() as string
    // dialog.showErrorBox('Welcome Back', `You arrived from: ${Url}`)
    handleDeepLink(mainWindow, new URL(Url))
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))

    createWindow()

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('open-url', (event, url) => {
    event.preventDefault()
    dialog.showErrorBox('Welcome Back', `You arrived from: ${url}, ${params}`)
    handleDeepLink(mainWindow, new URL(url))
  })
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 350,
    height: 400,
    minHeight: 400,
    minWidth: 300,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    },
    frame: false,
    // transparent: true,
    alwaysOnTop: true,
    focusable: false
    // icon: path.join(process.env['ELECTRON_RENDERER_URL'], 'flarecast.svg')
  })

  mainWindow.webContents.openDevTools()
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
    focusable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    },
    transparent: true,
    skipTaskbar: true
  })

  studio.webContents.openDevTools()
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
    focusable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    },
    transparent: true
  })

  floatingWebCam.setContentProtection(true)

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
  console.log('media:sources', payload)
  studio.webContents.send('profile:received', payload)
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
// app.disableHardwareAcceleration()
