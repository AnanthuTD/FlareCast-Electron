import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getMediaSources = async () => {
  try {
    const screens = await window.api.media.getScreenStream()
    if (!screens || screens.length === 0) {
      throw new Error('No screen sources available')
    }

    const enumerateDevices = await navigator.mediaDevices.enumerateDevices()

    const audioInputs = enumerateDevices.filter((device) => {
      return device.kind === 'audioinput'
    })

    const videoInputs = enumerateDevices.filter((device) => {
      return device.kind === 'videoinput'
    })

    return { screens, audioInputs, videoInputs }
  } catch (error) {
    console.error('Error fetching media sources:', error)
    return { error }
  }
}

export const getScreens = async () => {
  try {
    const screens = await window.api.media.getScreenStream()
    if (!screens || screens.length === 0) {
      throw new Error('No screen sources available')
    }

    return { screens }
  } catch (error) {
    console.error('Error fetching screen sources:', error)
    return []
  }
}

export const getCameras = async () => {
  try {
    const enumerateDevices = await navigator.mediaDevices.enumerateDevices()

    const videoInputs = enumerateDevices.filter((device) => {
      return device.kind === 'videoinput'
    })

    return { videoInputs }
  } catch (error) {
    console.error('Error fetching camera sources:', error)
    return { videoInputs: [] }
  }
}

export const getMicrophones = async () => {
  try {
    const enumerateDevices = await navigator.mediaDevices.enumerateDevices()

    const audioInputs = enumerateDevices.filter((device) => {
      return device.kind === 'audioinput'
    })

    return { audioInputs }
  } catch (error) {
    console.error('Error fetching microphone sources:', error)
    return { audioInputs: [] }
  }
}

export const videoRecordingTime = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60)
    .toString()
    .padStart(2, '0')
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
    .toString()
    .padStart(2, '0')
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    .toString()
    .padStart(2, '0')

  return { length: `${hours}:${minutes}:${seconds}`, hours, minutes, seconds }
}
