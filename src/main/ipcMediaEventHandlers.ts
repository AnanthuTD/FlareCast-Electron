import { desktopCapturer, session, ipcMain } from 'electron'
import { AppEvents } from './events'
import { BrowserWindow } from 'electron/main'

interface Props {
  studio: BrowserWindow
}

export default function ipcMediaEventHandlers({ studio }: Props) {
  ipcMain.on(AppEvents.SEND_MEDIA_SOURCES, (_event, payload) => {
    try {
      studio.webContents.send(AppEvents.PROFILE_RECEIVED, payload)
    } catch (error) {
      console.log('failed to send profile')
    }
  })

  ipcMain.handle(AppEvents.GET_SOURCES, async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        fetchWindowIcons: true
      })

      return sources.map((source) => ({
        deviceId: source.id,
        label: source.name,
        thumbnail: source.thumbnail.toDataURL(),
        icon: source.appIcon
      }))
    } catch (error) {
      console.error('Failed to get sources:', error)
      return []
    }
  })

  ipcMain.handle(AppEvents.GET_SCREEN_CAPTURE, async (_event, id: string) => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        fetchWindowIcons: true
      })

      const selectedSource = sources.find((s) => s.id === id)

      if (!selectedSource) return null

      const mediaStream = await new Promise((resolve) => {
        session.defaultSession.setDisplayMediaRequestHandler((_request, callback) => {
          callback({
            video: selectedSource,
            audio: 'loopback'
          })
        })

        resolve({
          video: selectedSource,
          audio: 'loopback'
        })
      })

      return mediaStream
    } catch (error) {
      console.error('Failed to capture screen and audio:', error)
      throw error
    }
  })
}
