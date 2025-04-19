import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUserStore } from '@renderer/stores/userStore'
import SignIn from '@renderer/components/sign-in'
import { checkAuthentication } from '@renderer/api/api'
import { toast } from 'sonner'

interface AuthContextType {
  errorMessage: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setUser = useUserStore((state) => state.setUser)
  const logout = useUserStore((state) => state.logout)
  const userId = useUserStore((state) => state.id)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    window.api.auth.onAuthSuccess(async (data) => {
      if (data.user) {
        setUser(data.user)
      } else {
        toast.error('No user data received on auth success')
        setErrorMessage('No user data received on auth success')
      }
    })

    window.api.auth.onAuthFailure((data) => {
      console.log('Auth failed with message: ', data.message)
      setErrorMessage(data.message)
      logout()
    })
  }, [])

  useEffect(() => {
    async function checkAuthorizedUser() {
      try {
        const data = await checkAuthentication()

        if (data.user) {
          setUser(data.user)
          window.api.studio.hidePluginWindow(false)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        window.api.studio.hidePluginWindow(true)
        logout()
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
