export interface SubscriptionPlan {
  id: string
  planId: string
  name: string
  price: number
  interval: number
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  maxRecordingDuration?: number
  hasAiFeatures: boolean
  allowsCustomBranding: boolean
  hasAdvancedEditing: boolean
  maxMembers?: number
  maxVideoCount?: number
  maxWorkspaces?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Studio {
  id: string
  screen: string | null
  mic: string | null
  camera: string | null
  userId: string | null
}

export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  createdAt: Date
  plan: SubscriptionPlan | null
  studio: Studio | null
}

export interface Profile {
  status: number
  user: User | null
}
