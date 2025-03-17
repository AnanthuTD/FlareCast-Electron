import React, { useEffect, useRef, useState } from 'react'
import { ThemeProvider } from './providers/theme-provider'

const WebcamApp: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [showLayout, setShowLayout] = useState(false)

  useEffect(() => {
    const handleWebcamChange = async (deviceId: string) => {
      try {
        if (!deviceId) {
          setShowLayout(false)
          return
        }

        setShowLayout(true)

        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId },
          audio: true
        })

        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream
          await videoRef.current.play()
        }
      } catch (error) {
        console.error('Error accessing webcam:', error)
      }
    }

    const unsubscribe = window.api.webcam.onWebcamChange(handleWebcamChange)

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return (
    showLayout && (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="draggable overflow-hidden h-screen rounded-full aspect-square flex items-center justify-center bg-gray-900">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="mirror rounded-full w-full h-full shadow-lg border border-gray-700 max-w-full max-h-full object-cover"
          />
        </div>
      </ThemeProvider>
    )
  )
}

export default WebcamApp
