import React from 'react'
import { UserStoreContext } from './providers/UserStoreProvider'
import { AuthProvider } from './providers/AuthProvider'

const App: React.FC = () => {
  const handleSignIn = () => {
    const authURL = 'https://example.com/auth'
    window.open(authURL, '_blank')
  }

  return (
    <UserStoreContext>
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
    </UserStoreContext>
  )
}

export default App
