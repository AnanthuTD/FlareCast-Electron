import { createWriteStream } from 'fs'
import React from 'react'
import { io } from 'socket.io-client'
import { Sources } from 'src/types/types'
import { v4 as uuid } from 'uuid'

let videoTransferFileName: string | undefined
let mediaRecorder: MediaRecorder
let userId: string

const socket = io(import.meta.env.VITE_SOCKET_URL)

export const startRecording = (onSources: { screen: string; audio: string; id: string }) => {
  window.api.studio.hidePluginWindow(true)
  videoTransferFileName = `${uuid()}-${onSources.id.slice(0, 8)}.webm`
  mediaRecorder.start(1000)
}

export const onStopRecording = () => {
  mediaRecorder.stop()
}

const recordedBlobs: BlobEvent['data'][] = []
let count = 0

// Handle `onDataAvailable`
export const onDataAvailable = (e: BlobEvent) => {
  console.log(e.data)
  console.log('chunk: ', count + 1)
  recordedBlobs.push(e.data)

  const reader = new FileReader()

  reader.onloadend = () => {
    // Use onloadend for TypedArray
    const buffer = new Uint8Array(reader.result) // Create a typed array
    socket.emit('video:chunks', {
      chunks: buffer,
      fileName: videoTransferFileName,
      count: ++count
    })
  }

  reader.readAsArrayBuffer(e.data) // Read the Blob as ArrayBuffer
}

// Save the recorded video locally
export const saveVideo = () => {
  const blob = new Blob(recordedBlobs, { type: 'video/webm' })
  const url = URL.createObjectURL(blob)

  // Create a downloadable link
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = `${videoTransferFileName}.webm`
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(url)
}

export const stopRecording = () => {
  window.api.studio.hidePluginWindow(false)
  socket.emit('process:video', {
    fileName: videoTransferFileName,
    userId
  })
}

export const selectSources = async (
  onSources: Sources,
  videoElement: React.RefObject<HTMLVideoElement>
) => {
  if (onSources && onSources.screen && onSources.audio && onSources.id) {
    const constraints = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: onSources.screen,
          minWidth: onSources.preset === 'HD' ? 1920 : 1280,
          minHeight: onSources.preset === 'HD' ? 1080 : 720,
          maxWidth: onSources.preset === 'HD' ? 1920 : 1280,
          maxHeight: onSources.preset === 'HD' ? 1080 : 720,
          frameRate: onSources.preset === 'HD' ? 60 : 30
        }
      }
    }

    userId = onSources.id

    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    console.log('=========stream=========')
    console.log(stream)
    console.log('========================')

    const audioStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: onSources.audio ? { deviceId: { exact: onSources.audio } } : false
    })

    console.log(videoElement, videoElement.current)

    if (videoElement && videoElement.current) {
      console.log('================================')
      console.log('streaming to video element')
      console.log('================================')
      videoElement.current.srcObject = stream
      await videoElement.current.play()
    }

    const combinedStream = new MediaStream([...stream.getTracks(), ...audioStream.getTracks()])

    mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm; codecs=vp9'
    })

    mediaRecorder.ondataavailable = onDataAvailable

    mediaRecorder.onstop = stopRecording
  }
}
