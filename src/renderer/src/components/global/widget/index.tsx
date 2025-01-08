import { useUserStore } from '@renderer/stores/userStore'
import { Profile } from '@renderer/types/types'
import React, { useState } from 'react'

const Widget = () => {
  const [profile, setProfile] = useState<Profile>(null)
  const user = useUserStore()
  return <div>Widget</div>
}

export default Widget
