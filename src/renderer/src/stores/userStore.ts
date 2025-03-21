import { create } from 'zustand'

export type UserState = {
  accessToken: string
  firstName: string
  lastName: string
  email: string
  image: string | null
  id: string
}

export type UserActions = {
  setAccessToken: (accessToken: string) => void
  setFirstName: (firstName: string) => void
  setLastName: (lastName: string) => void
  setEmail: (email: string) => void
  setImage: (image: string | null) => void
  setId: (id: string) => void
  logout: () => void
  setUser: (user: UserState) => void
  clearAccessToken: () => void
}

export type UserStore = UserState & UserActions

export const defaultInitState: UserState = {
  accessToken: '',
  firstName: '',
  lastName: '',
  email: '',
  image: null,
  id: ''
}

export const useUserStore = create<UserStore>((set) => ({
  ...defaultInitState,

  setAccessToken: (accessToken: string) => set(() => ({ accessToken })),
  setFirstName: (firstName: string) => set(() => ({ firstName })),
  setLastName: (lastName: string) => set(() => ({ lastName })),
  setEmail: (email: string) => set(() => ({ email })),
  setImage: (image: string | null) => set(() => ({ image })),
  setId: (id: string) => set(() => ({ id })),
  logout: () => set(() => defaultInitState),
  setUser: (user: UserState) => set(() => ({ ...user })),
  clearAccessToken: () => set(() => ({ accessToken: '' }))
}))
