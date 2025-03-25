import { BrowserWindow } from 'electron'
import { AppEvents } from './events'

export function handleDeepLink(mainWindow: BrowserWindow, studio: BrowserWindow, url: URL): void {
  console.log(url)
  console.log('================================')
  console.log('handleDeepLink invoked with url:', url, '\n', url.pathname)
  console.log('================================')
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
    case '/preset':
      console.log(
        'Setting preset:',
        url.searchParams.get('workspaceId'),
        url.searchParams.get('spaceId'),
        url.searchParams.get('folderId')
      )
      studio.webContents.send(AppEvents.SET_PRESET, {
        workspaceId: url.searchParams.get('workspaceId'),
        spaceId: url.searchParams.get('spaceId'),
        folderId: url.searchParams.get('folderId')
      })
      break
    default:
      break
  }
}
