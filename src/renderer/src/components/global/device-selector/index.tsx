import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { CameraIcon, Mic, Monitor, Video, VideoIcon } from 'lucide-react'
import SelectorButton, { SelectorButtonProps } from './SelectorButton'
import { getCameras, getMediaSources, getMicrophones, getScreens } from '@renderer/lib/utils'
import { useUserStore } from '@renderer/stores/userStore'

interface Screen {
  deviceId: string
  label: string
  thumbnail: string
}

function DeviceSelector() {
  const userId = useUserStore((state) => state.id)

  const [screenOptions, setScreenOptions] = useState<Screen[]>([])
  const [cameraOptions, setCameraOptions] = useState<MediaDeviceInfo[]>([])
  const [micOptions, setMicOptions] = useState<MediaDeviceInfo[]>([])

  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null)
  const [selectedMic, setSelectedMic] = useState<MediaDeviceInfo | null>(null)
  const [selectedCam, setSelectedCam] = useState<MediaDeviceInfo | null>(null)

/*   useEffect(() => {
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
  }, []) */

  const fetchScreens = async () => {
    try {
      console.log('Fetching screens ...')
      // fetch screens and windows
      const { screens } = (await getScreens()) || { screens: [] }
      setScreenOptions(screens || [])
      console.log('screens: ', screens)
      if (screens.length === 1) setSelectedScreen(screens?.[0] || null)
    } catch (error) {
      console.error('Error fetching media sources:', error)
    }
  }

  const fetchCameras = async () => {
    try {
      const cameras = await getCameras()
      setCameraOptions(cameras.videoInputs || [])
    } catch (error) {
      console.error('Error fetching media sources:', error)
    }
  }

  const fetchMicrophones = async () => {
    try {
      const microphones = await getMicrophones()
      setMicOptions(microphones.audioInputs || [])
      setSelectedMic(microphones.audioInputs?.[0] || null)
    } catch (error) {
      console.error('Error fetching media sources:', error)
    }
  }

  useEffect(() => {
    window.api.media.sendMediaSources({
      screen: selectedScreen?.deviceId,
      audio: selectedMic?.deviceId,
      id: userId
    })
  }, [selectedMic, selectedScreen])

  useEffect(() => {
    window.api.webcam.changeWebcam(selectedCam?.deviceId)
  }, [selectedMic, selectedScreen, selectedCam])

  const NoScreenOption = {
    label: 'No Screen',
    icon: <Monitor />,
    deviceId: '',
    thumbnail: undefined
  }
  const NoCamOption = {
    label: 'No Cam',
    icon: <Video />,
    deviceId: '',
    thumbnail: undefined
  }
  const NoMicOption = {
    label: 'No Mic',
    icon: <Mic />,
    deviceId: '',
    thumbnail: undefined
  }

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
    options: [
      NoScreenOption,
      ...screenOptions.map((selector) => ({
        deviceId: selector.deviceId,
        label: selector.label,
        icon: <Monitor />,
        ...(selector.thumbnail && { thumbnail: selector.thumbnail })
      }))
    ],
    onClick: () => {
      console.log('Click on screen selector')
      fetchScreens()
    }
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
    options: [
      NoCamOption,
      ...cameraOptions.map((selector) => ({
        deviceId: selector.deviceId,
        label: selector.label,
        icon: <Video />
      }))
    ],
    onClick: () => {
      fetchCameras()
    }
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
    options: [
      NoMicOption,
      ...micOptions.map((selector) => ({
        deviceId: selector.deviceId,
        label: selector.label,
        icon: <Mic />
      }))
    ],
    onClick: () => {
      fetchMicrophones()
    }
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
      </TabsContent>
      <TabsContent value="screen-shot">Work in progress</TabsContent>
    </Tabs>
  )
}

export default DeviceSelector
