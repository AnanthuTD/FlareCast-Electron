import {
  checkWebsocketConnection,
  onStopRecording,
  selectSources,
  startRecording
} from '@renderer/lib/recorder'
import { cn, videoRecordingTime } from '@renderer/lib/utils'
import { Cast, Pause, RadioIcon, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PresetSetCallbackProps, Sources } from 'src/types/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@renderer/components/ui/tooltip'
import { toast } from 'sonner'
import { canRecord, getStreamToken } from '@renderer/api/api'

const StudioTray = () => {
  const [preview, setPreview] = useState(false)
  const [recording, setRecording] = useState(false)
  const [onTimer, setOnTimer] = useState('00:00:00')
  const [onSources, setOnSources] = useState<Sources | undefined>(undefined)
  const [isLive, setIsLive] = useState(false)
  const [preset, setPreset] = useState<null | PresetSetCallbackProps>(null)

  const videoElement = useRef<HTMLVideoElement | null>(null)
  const recordingStartTime = useRef<number | null>(null)

  useEffect(() => {
    checkWebsocketConnection()

    const unsub = window.api.studio.onSourceReceived((profile: Sources) => {
      if (JSON.stringify(profile) === JSON.stringify(onSources)) return
      console.log('Received sources:', profile)
      setOnSources(profile)
    })

    return unsub
  }, [])

  useEffect(() => {
    const unsub = window.api.preset.set((data) => {
      console.log('Received preset:', data)

      setPreset(data)
    })

    return unsub
  }, [setPreset, preset])

  const clearTime = () => {
    setOnTimer('00:00:00')
    recordingStartTime.current = null
  }

  useEffect(() => {
    if (!onSources || !videoElement.current) return
    if (!onSources.screen) {
      toast.info('No screen selected! select a screen to start recording')
      videoElement.current.srcObject = null
      return
    }
    selectSources(onSources, videoElement).catch((err) =>
      console.error('Failed to select sources:', err)
    )
  }, [onSources])

  useEffect(() => {
    if (!recording) {
      clearTime()
      return
    }

    recordingStartTime.current = Date.now()
    const recordTimeInterval = setInterval(() => {
      if (!recordingStartTime.current) return
      const elapsed = Date.now() - recordingStartTime.current
      const recordingTime = videoRecordingTime(elapsed)
      setOnTimer(recordingTime.length)

      const maxDuration = onSources?.plan?.maxRecordingDuration ?? 5
      if (elapsed / 60000 >= maxDuration) {
        // Convert ms to minutes
        setRecording(false)
        clearTime()
        onStopRecording()
        // saveVideo().catch((err) => console.error('Save video failed:', err))
      }
    }, 1000) // Update every second

    return () => clearInterval(recordTimeInterval)
  }, [recording, onSources])

  const handleStartRecording = async () => {
    if (!onSources) return
    let streamKey = ''

    if (!isLive) {
      const socketConnected = await checkWebsocketConnection()
      if (!socketConnected) {
        toast.error('Unauthorized, please signin again!')
        console.log('WebSocket connection not established')
        // setTimeout(() => checkWebsocketConnection(), 5000)
        return
      }
    } else {
      const data = await getStreamToken(preset)
      if (!data) {
        console.log('Failed to get stream token')
        return
      }
      streamKey = data.streamKey
    }

    try {
      const hasPermission = await canRecord()
      if (hasPermission) {
        console.log('Recording allowed')
      } else {
        toast.error('Recording not allowed')
        console.log('Recording not allowed')
        return
      }

      console.log('isLive recording: ', isLive)

      startRecording(onSources, preset, isLive, streamKey)
      setRecording(true)
    } catch (err) {
      console.error('Start recording failed:', err)
    }
  }

  const handleStopRecording = async () => {
    try {
      setPreset(null)
      onStopRecording()
      // await saveVideo()
      setRecording(false)
      clearTime()
    } catch (err) {
      console.error('Stop recording failed:', err)
    }
  }

  return !onSources ? (
    <></>
  ) : (
    <div className="flex flex-col gap-y-5 h-screen justify-end draggable clickable">
      <video
        autoPlay
        ref={videoElement}
        className={cn('w-6/12 border-2 self-end object-cover', !preview ? 'hidden' : '')}
      />
      <div className="rounded-full flex justify-around items-center h-11 w-full border-2 bg-[#171717] draggable border-white/40">
        <div
          onClick={handleStartRecording}
          className={cn(
            'non-draggable rounded-full cursor-pointer relative hover:opacity-80',
            recording ? 'bg-red-500 w-6 h-6' : 'bg-red-400 w-8 h-8'
          )}
        >
          {recording && (
            <span className="absolute -right-16 top-1/2 transform -translate-y-1/2 text-white">
              {onTimer}
            </span>
          )}
        </div>
        {!recording ? (
          <Pause className="non-draggable opacity-50" size={32} fill="white" stroke="none" />
        ) : (
          <Square
            size={32}
            className="non-draggable cursor-pointer hover:scale-110 transform transition duration-150"
            fill="white"
            onClick={handleStopRecording}
            stroke="white"
          />
        )}
        <Cast
          onClick={() => {
            setPreview((prev) => {
              window.api.studio.resize(prev)
              return !prev
            })
          }}
          size={32}
          fill="white"
          className="non-draggable cursor-pointer hover:opacity-60"
          stroke="white"
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild className="non-draggable cursor-pointer hover:opacity-60">
              <RadioIcon
                onClick={() => !recording && setIsLive((prev) => !prev)}
                className={cn(
                  isLive ? 'text-red-600' : 'text-gray-500',
                  recording ? 'hover:cursor-not-allowed' : ''
                )}
                aria-label="go live"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Go Live</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export default StudioTray
