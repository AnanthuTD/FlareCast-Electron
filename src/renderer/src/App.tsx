import React from 'react'
import { AuthProvider } from './providers/AuthProvider'
import { UserStoreProvider } from './providers/UserStoreProvider'

const App: React.FC = () => {
  return (
    <UserStoreProvider>
      <AuthProvider>
        <h1 className="text-red-900">Authenticated</h1>
      </AuthProvider>
    </UserStoreProvider>
  )
}

export default App
