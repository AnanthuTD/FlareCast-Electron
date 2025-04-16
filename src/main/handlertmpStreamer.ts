import ffmpeg from 'fluent-ffmpeg'
import { Readable } from 'stream'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { ipcMain } from 'electron'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

let ffmpegProcess: ffmpeg.FfmpegCommand | null = null
let readableStream: Readable | null = null

export function setupRtmpStreaming() {
  ipcMain.handle('start-rtmp-stream', async (_event, { rtmpUrl }) => {
    if (ffmpegProcess) return 'Stream already running'
    readableStream = new Readable({ read() {} })
    ffmpegProcess = ffmpeg(readableStream)
      .inputFormat('webm')
      .inputOptions(['-re'])
      .outputOptions(['-c:v', 'libx264', '-c:a', 'aac', '-f', 'flv'])
      .output(rtmpUrl)
      .on('start', () => console.log('RTMP streaming started to:', rtmpUrl))
      .on('error', (err) => console.error('RTMP streaming error:', err))
      .on('end', () => console.log('RTMP streaming ended'))
      .run()
    return 'RTMP stream started'
  })

  ipcMain.handle('send-video-chunk', async (_event, chunk: Uint8Array) => {
    if (!readableStream) return 'Stream not initialized'
    readableStream.push(Buffer.from(chunk))
    return 'Chunk sent'
  })

  ipcMain.handle('stop-rtmp-stream', async () => {
    if (!ffmpegProcess || !readableStream) return 'No stream running'
    readableStream.push(null)
    ffmpegProcess = null
    readableStream = null
    return 'RTMP stream stopped'
  })
}
