import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserState, useUserStore } from '@renderer/stores/userStore'
import axios from 'axios'
import axiosInstance from '@renderer/axios'
import SignIn from '@renderer/components/sign-in'

interface AuthContextType {
  errorMessage: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setUser = useUserStore((state) => state.setUser)
  const userId = useUserStore((state) => state.id)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleAuthError = (error: any) => {
    console.error('Authentication error:', error)
    setErrorMessage('Failed to authenticate user')
  }

  useEffect(() => {
    window.api.auth.onAuthSuccess(async (data) => {
      try {
        /* 
          On initial authentication use the refresh token received from the deep link to send a post-login request
          which will validate the refresh token and set the new one in the cookie for further requests and send back the 
          accessToken and user data
        */
        const res = await axios.post('api/user/auth/post-login', {
          refreshToken: data.refreshToken
        })

        if (res.data.user) {
          console.log('User data:', res.data.user)
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

  useEffect(() => {
    async function checkAuthorizedUser() {
      try {
        const { data } = await axiosInstance.get('/api/user/auth/check-authentication')

        if (data.user) {
          setUser(data.user)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthorizedUser()
  }, [setUser])

  return (
    <AuthContext.Provider value={{ errorMessage }}>
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
        >
          <p>Loading...</p>
        </div>
      ) : userId ? (
        children
      ) : (
        <SignIn />
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
