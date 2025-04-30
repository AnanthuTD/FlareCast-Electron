import React from 'react'
import { io } from 'socket.io-client'
import { Sources } from 'src/types/types'
import { v4 as uuid } from 'uuid'

let videoTransferFileName: string | undefined
let mediaRecorder: MediaRecorder | undefined
let userId: string
let rtmpUrl = import.meta.env.VITE_RTMP_URL
let isLive = false
let preset: { workspaceId: string; spaceId: string; folderId: string } | null = null
let refreshTryCount = 0

const getAccessToken = async () => {
  return await window.api.auth.getAccessToken()
}

async function connectToWebsocket() {
  const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
    path: import.meta.env.VITE_SOCKET_URL_PATH,
    transports: ['websocket'],
    auth: {
      token: await getAccessToken()
    },
    withCredentials: true
  })

  newSocket.on('connect_error', async (err) => {
    // alert('Connection error! ' + refreshTryCount)

    // if (refreshTryCount !== 0) {
    //   console.error('Already tried to refresh one time!')
    //   window.api.studio.hidePluginWindow(true)
    //   return
    // }

    console.log(err instanceof Error)
    console.log(err.message)
    refreshTryCount++
    try {
      const isRefreshed = await window.api.auth.handleUnauthorized()
      if (!isRefreshed) throw new Error('Failed to refresh token')
      refreshTryCount = 0
    } catch (e) {
      console.error(e)
    }
  })

  return newSocket
}

let socket = await connectToWebsocket()

socket.on('error', (error) => {
  console.error('Socket error:', error)
})

socket.on('connect', () => {
  console.log('Connected to socket: ' + socket.id)
})

export const checkWebsocketConnection = async () => {
  console.log('Socket status: ', socket.connected)

  if (socket.connected) {
    console.log('App is Connected to socket initially: ' + socket.id)
    return true
  }

  try {
    socket = await connectToWebsocket()
    if (socket.connected) {
      console.log('is connected: ', socket.connected)
      return true
    }
    console.log('Connecting to socket failed!')
    return false
  } catch (err) {
    console.error('Error connecting to websocket', err)
    return false
  }
}

export const startRecording = async (
  onSources: { screen: string; audio: string; id: string },
  p: typeof preset,
  isLiveParams: boolean,
  streamKey: string
) => {
  console.log('preset', p)
  if (p) {
    preset = p
  }

  if (!mediaRecorder) return
  isLive = isLiveParams

  // window.api.studio.hidePluginWindow(true)
  videoTransferFileName = `${uuid()}-${onSources.id.slice(0, 8)}.webm`

  if (isLive) {
    console.log('live: ' + isLive)

    rtmpUrl = `${import.meta.env.VITE_RTMP_URL}/${streamKey}`
    await window.api.liveStream.startRtmpStream(rtmpUrl) // Start RTMP in main process
    mediaRecorder.start(100) // 100ms chunks for lower latency
  } else {
    mediaRecorder.start(1000) // Non-live recording
  }
}

let isStopped = false
export const onStopRecording = () => {
  isStopped = true
  if (mediaRecorder) {
    mediaRecorder.stop()
  }
  if (isLive) {
    window.api.liveStream
      .stopRtmpStream()
      .then((result) => console.log(result))
      .catch((err) => console.error('RTMP stop error:', err))
  }
}

const recordedBlobs: BlobEvent['data'][] = []
let count = 0

export const onDataAvailable = async (e: BlobEvent) => {
  console.log('Chunk:', count + 1, e.data.size, 'bytes')
  if (isLive) {
    // Send chunk to main process via IPC
    const reader = new FileReader()
    reader.onloadend = async () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer)
      await window.api.liveStream.sendVideoChunk(buffer)
    }
    reader.readAsArrayBuffer(e.data)
  } else {
    // Non-live mode
    recordedBlobs.push(e.data)
    const reader = new FileReader()
    reader.onloadend = () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer)
      socket.emit('video:chunks', {
        chunks: buffer,
        fileName: videoTransferFileName,
        count: ++count,
        preset
      })
    }
    reader.readAsArrayBuffer(e.data)
  }
}

export const saveVideo = () => {
  const blob = new Blob(recordedBlobs, { type: 'video/webm' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = `${videoTransferFileName}.webm`
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(url)
}

export const stopRecording = () => {
  if (!isStopped || !mediaRecorder || isLive) return

  // window.api.studio.hidePluginWindow(false)
  socket.emit('process:video', {
    fileName: videoTransferFileName,
    userId,
    preset
  })
  isStopped = false
  recordedBlobs.length = 0
  count = 0
  preset = null
}

export const selectSources = async (
  onSources: Sources,
  videoElement: React.RefObject<HTMLVideoElement>
) => {
  try {
    console.log('=========selecting sources=========')
    if (onSources && onSources.screen && onSources.id) {
      const constraints = {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: onSources.screen,
            frameRate: 60
          }
        }
      }

      userId = onSources.id
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      console.log('=========stream=========')
      console.log(stream)
      console.log('========================')

      if (videoElement && videoElement.current) {
        console.log('Streaming to video element')
        videoElement.current.srcObject = stream
        await videoElement.current.play()
      }

      let combinedStream = new MediaStream([...stream.getTracks()])
      if (onSources.audio) {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: onSources.audio ? { deviceId: { exact: onSources.audio } } : false
        })
        combinedStream = new MediaStream([...stream.getTracks(), ...audioStream.getTracks()])
      }

      if (mediaRecorder) {
        mediaRecorder.stop()
      }

      mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm; codecs=vp9'
      })

      mediaRecorder.ondataavailable = onDataAvailable
      mediaRecorder.onstop = stopRecording
    }
  } catch (error) {
    console.error('Error selecting sources:', error)
  }
}
