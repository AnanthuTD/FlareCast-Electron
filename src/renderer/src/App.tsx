import React from 'react'
import { AuthProvider } from './providers/AuthProvider'
import { UserStoreProvider } from './providers/UserStoreProvider'

const App: React.FC = () => {
  const handleSignIn = () => {
    const authURL = 'https://example.com/auth'
    window.open(authURL, '_blank')
  }

  return (
    <UserStoreProvider>
      <AuthProvider>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <button
            onClick={handleSignIn}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
        </div>
      </AuthProvider>
    </UserStoreProvider>
  )
}

export default App
