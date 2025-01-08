import { BrowserWindow, desktopCapturer, session, ipcMain } from 'electron'

export default function handleMediaEvents(mainWindow: BrowserWindow) {
  // Handle 'get-sources' IPC call to get available screen and window sources
  ipcMain.handle('get-sources', async () => {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      fetchWindowIcons: true
    })

    return sources.map((source) => ({
      deviceId: source.id,
      label: source.name,
      thumbnail: source.thumbnail.toDataURL()
    }))
  })

  // Handle the screen capture with system audio (loopback)
  ipcMain.handle('get-screen-capture', async (_event, id: string) => {
    try {
      // Fetch screen and window sources
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        fetchWindowIcons: true,
      })

      const selectedSource = sources.find((s) => s.id === id)

      if (!selectedSource) return null

      // Use `setDisplayMediaRequestHandler` to request screen and audio capture
      const mediaStream = await new Promise((resolve, reject) => {
        session.defaultSession.setDisplayMediaRequestHandler((_request, callback) => {
          callback({
            video: selectedSource,
            audio: 'loopback' // Capture system audio
          })
        })

        // Resolve the media stream once the handler completes
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
