import { User } from '@renderer/types/types'
import { create } from 'zustand'

export type UserActions = {
  setFirstName: (firstName: string) => void
  setLastName: (lastName: string) => void
  setEmail: (email: string) => void
  setImage: (image: string | null) => void
  setId: (id: string) => void
  logout: () => void
  setUser: (user: User) => void
}

export type UserStore = User & UserActions

export const defaultInitState: User = {
  firstName: '',
  lastName: '',
  email: '',
  image: null,
  id: ''
}

export const useUserStore = create<UserStore>((set) => ({
  ...defaultInitState,

  setFirstName: (firstName: string) => set(() => ({ firstName })),
  setLastName: (lastName: string) => set(() => ({ lastName })),
  setEmail: (email: string) => set(() => ({ email })),
  setImage: (image: string | null) => set(() => ({ image })),
  setId: (id: string) => set(() => ({ id })),
  logout: () => set(() => defaultInitState),
  setUser: (user: User) => set(() => ({ ...user }))
}))
