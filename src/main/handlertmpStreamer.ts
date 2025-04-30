import ffmpeg from 'fluent-ffmpeg'
import { Readable } from 'stream'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { ipcMain } from 'electron/main'
import { AppEvents } from './events'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

let ffmpegProcess: ffmpeg.FfmpegCommand | null = null
let readableStream: Readable | null = null

export function handleRtmpStream() {
  ipcMain.handle(AppEvents.START_STREAM, async (_event, { rtmpUrl }) => {
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

  ipcMain.handle(AppEvents.SEND_VIDEO_CHUNK, async (_event, chunk: Uint8Array) => {
    if (!readableStream) return 'Stream not initialized'
    readableStream.push(Buffer.from(chunk))
    return 'Chunk sent'
  })

  ipcMain.handle(AppEvents.STOP_STREAM, async () => {
    if (!ffmpegProcess || !readableStream) return 'No stream running'
    readableStream.push(null)
    ffmpegProcess = null
    readableStream = null
    return 'RTMP stream stopped'
  })
}
