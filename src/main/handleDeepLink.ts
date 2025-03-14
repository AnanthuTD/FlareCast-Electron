import { BrowserWindow } from 'electron'
import { AppEvents } from './events'

export function handleDeepLink(mainWindow: BrowserWindow, url: URL): void {
  /* console.log('================================')
  console.log('handleDeepLink invoked with url:', url, '\n', url.pathname)
  console.log('================================') */
  switch (url.pathname) {
    case '/auth/success':
      mainWindow.webContents.send(AppEvents.AUTHENTICATION_SUCCESS, {
        refreshToken: url.searchParams.get('refreshToken')
      })
      break
    case '/auth/failure':
      mainWindow.webContents.send(AppEvents.AUTHENTICATION_FAILURE, {
        message: url.searchParams.get('message')
      })
      break

    default:
      break
  }
}
