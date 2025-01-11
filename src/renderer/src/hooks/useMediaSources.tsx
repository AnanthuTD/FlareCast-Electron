import { useReducer } from ' react'

export interface Display {
  applcon: null
  display_id: string
  id: string
  name: string
  thumbnail: unknown[]
}

export interface AudioInput {
  deviceId: string
  kind: string
  label: string
  groupId: string
  error?: string | null
  isPending?: boolean
}

export type SourceDeviceStateProps = {
  displays?: Display[]
  audioInputs?: AudioInput[]
}

export const useMediaSources = ({}) => {
  const [state, action] = useReducer()

  const fetchMediaSources = () => {
    action
  }
}
