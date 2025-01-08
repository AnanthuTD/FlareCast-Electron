import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { CameraIcon, Mic, Monitor, Settings2, Video, VideoIcon } from 'lucide-react'
import SelectorButton, { SelectorButtonProps } from './SelectorButton'
import { getMediaSources } from '@renderer/lib/utils'
import { Sources } from 'src/types/types'

interface Screen {
  deviceId: string
  label: string
  thumbnail: string
}

function DeviceSelector() {
  const [screenOptions, setScreenOptions] = useState<Screen[]>([])
  const [cameraOptions, setCameraOptions] = useState<MediaDeviceInfo[]>([])
  const [micOptions, setMicOptions] = useState<MediaDeviceInfo[]>([])

  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null)
  const [selectedMic, setSelectedMic] = useState<MediaDeviceInfo | null>(null)
  const [selectedCam, setSelectedCam] = useState<MediaDeviceInfo | null>(null)
  const [selectedResolution, setSelectedResolution] = useState<Sources['preset']>('HD')

  useEffect(() => {
    const fetchMediaSources = async () => {
      try {
        const mediaSources = await getMediaSources()
        setScreenOptions(mediaSources.screens || [])
        setMicOptions(mediaSources.audioInputs || [])
        setCameraOptions(mediaSources.videoInputs || [])

        setSelectedScreen(mediaSources.screens?.[0] || null)
        setSelectedMic(mediaSources.audioInputs?.[0] || null)
        setSelectedCam(mediaSources.videoInputs?.[0] || null)
      } catch (error) {
        console.error('Error fetching media sources:', error)
      }
    }

    fetchMediaSources()
  }, [])

  useEffect(() => {
    window.api.media.sendMediaSources({
      screen: selectedScreen?.deviceId,
      audio: selectedMic?.deviceId,
      preset: selectedResolution,
      plan: 'FREE',
      id: '1234567890'
    })
    window.api.webcam.changeWebcam(selectedCam?.deviceId)
  }, [selectedMic, selectedResolution, selectedScreen, selectedCam])

  const screenSelector: SelectorButtonProps = {
    icon: <Monitor />,
    label: screenOptions.length > 0 ? 'Select Screen' : 'No Screen',
    onSelect: (deviceId) => {
      const selected = screenOptions.find((screen) => screen.deviceId === deviceId)
      if (selected) {
        setSelectedScreen(selected)
        console.log('Selected screen device:', selected)
      }
    },
    options: screenOptions.map((selector) => ({
      deviceId: selector.deviceId,
      label: selector.label,
      icon: <Monitor />,
      ...(selector.thumbnail && { thumbnail: selector.thumbnail })
    }))
  }

  const cameraSelector: SelectorButtonProps = {
    icon: <Video />,
    label: cameraOptions.length > 0 ? 'Select Camera' : 'No Camera',
    onSelect: (deviceId) => {
      const selected = cameraOptions.find((camera) => camera.deviceId === deviceId)
      if (selected) {
        setSelectedCam(selected)
        console.log('Selected camera device:', selected)
      }
    },
    options: cameraOptions.map((selector) => ({
      deviceId: selector.deviceId,
      label: selector.label,
      icon: <Video />
    }))
  }

  const micSelector: SelectorButtonProps = {
    icon: <Mic />,
    label: micOptions.length > 0 ? 'Select Microphone' : 'No Microphone',
    onSelect: (deviceId) => {
      const selected = micOptions.find((mic) => mic.deviceId === deviceId)
      if (selected) {
        setSelectedMic(selected)
        console.log('Selected microphone device:', selected)
      }
    },
    options: micOptions.map((selector) => ({
      deviceId: selector.deviceId,
      label: selector.label,
      icon: <Mic />
    }))
  }

  const resolutionSelector: SelectorButtonProps = {
    icon: <Settings2 />,
    label: 'HD',
    onSelect: (resolution) => {
      setSelectedResolution(resolution)
    },
    options: [
      {
        deviceId: 'SD',
        icon: <Settings2 />,
        label: 'SD'
      },
      {
        deviceId: 'HD',
        icon: <Settings2 />,
        label: 'HD'
      }
    ]
  }

  return (
    <Tabs defaultValue="video">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="video">
          <VideoIcon />
        </TabsTrigger>
        <TabsTrigger value="screen-shot">
          <CameraIcon />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="video" className="flex flex-col gap-4">
        <SelectorButton {...screenSelector} />
        <SelectorButton {...cameraSelector} />
        <SelectorButton {...micSelector} />
        <SelectorButton {...resolutionSelector} />
      </TabsContent>
      <TabsContent value="screen-shot">Work in progress</TabsContent>
    </Tabs>
  )
}

export default DeviceSelector
