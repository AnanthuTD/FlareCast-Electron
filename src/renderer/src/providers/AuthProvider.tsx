import axiosInstance from '@renderer/axios'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUserStore } from './UserStoreProvider'
import { UserState } from '@renderer/stores/userStore'

interface AuthContextType {
  errorMessage: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setUser = useUserStore((state) => state.setUser)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleAuthError = (error: any) => {
    console.error('Authentication error:', error)
    setErrorMessage('Failed to authenticate user')
  }

  useEffect(() => {
    window.api.auth.onAuthSuccess(async (data) => {
      try {
        /* 
          On initial authentication use the refresh token received from the deeplink to send a post-login request
          which will validate the refresh token and set the new one in the cookie for further requests and send back the 
          accessToken and user data
        */
        const res = await axiosInstance.post('/api/user/auth/post-login', {
          refreshToken: data.refreshToken
        })

        if (res.data.user) {
          setUser(res.data.user as UserState)
        }

        setErrorMessage(null)
      } catch (error) {
        handleAuthError(error)
      }
    })

    window.api.auth.onAuthFailure((data) => {
      setErrorMessage(data.message)
    })
  }, [])
  return <AuthContext.Provider value={{ errorMessage }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
