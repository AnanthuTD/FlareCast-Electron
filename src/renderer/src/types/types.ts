export enum SubscriptionPlan {
  PRO = 'PRO',
  FREE = 'FREE'
}

export interface Subscription {
  plan: SubscriptionPlan
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
  // subscription: Subscription | null
  studio: Studio | null
}

export interface Profile {
  status: number
  user: User | null
}
