import { onStopRecording, saveVideo, selectSources, startRecording } from '@renderer/lib/recorder'
import { cn, videoRecordingTime } from '@renderer/lib/utils'
import { Cast, Pause, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Sources } from 'src/types/types'

const StudioTray = () => {
  const [preview, setPreview] = useState(false)
  const [recording, setRecording] = useState(false)
  const [onTimer, setOnTimer] = useState('00:00:00')
  const [count, setCount] = useState(0)
  const [onSources, setOnSources] = useState<Sources | undefined>(undefined)

  const videoElement = useRef<HTMLVideoElement | null>(null)
  const initialTime = new Date()

  useEffect(() => {
    const unsub = window.api.studio.onSourceReceived((profile) => {
      if (JSON.stringify(profile) === JSON.stringify(onSources)) {
        return;
      }
      console.log(profile)
      setOnSources(profile)
    })

    return () => {
      unsub()
    }
  }, [])

  const clearTime = () => {
    setCount(0)
    setOnTimer('00:00:00')
  }

  useEffect(() => {
    console.log('videoElement: ', videoElement)
    if (onSources && onSources.screen) {
      selectSources(onSources, videoElement)
    }
    return () => {
      selectSources(onSources!, videoElement)
    }
  }, [onSources])

  useEffect(() => {
    if (!recording) return

    const recordTimeInterval = setInterval(() => {
      const time = count + (new Date().getTime() - initialTime.getTime())
      setCount(time)
      const recordingTime = videoRecordingTime(time)
      if (onSources?.plan === 'FREE' && recordingTime.minutes === '05') {
        setRecording(false)
        clearTime()
        onStopRecording()
      }

      setOnTimer(recordingTime.length)
      if (time <= 0) {
        setOnTimer('00:00:00')
        clearInterval(recordTimeInterval)
      }
    }, 1)

    return () => {
      clearInterval(recordTimeInterval)
    }
  }, [recording])

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
          {...(onSources && {
            onClick: () => {
              setRecording(true)
              startRecording(onSources)
            }
          })}
          className={cn(
            'non-draggable rouded-full cursor-pointer relative hover:opacity-80',
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
          <Pause className="non-draggable opacity-50 " size={32} fill="white" stroke="none" />
        ) : (
          <Square
            size={32}
            className="non-draggable cursor-pointer hover:scale-110 transform transition duration-150"
            fill="white"
            onClick={() => {
              setRecording(false)
              clearTime()
              onStopRecording()
              saveVideo()
            }}
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
      </div>
    </div>
  )
}

export default StudioTray
