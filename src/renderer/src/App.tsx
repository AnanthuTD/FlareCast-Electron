import React from 'react'
import { AuthProvider } from './providers/AuthProvider'
import ControlLayout from './layouts/ControlLayout'
import { ThemeProvider } from './providers/theme-provider'
import DeviceSelector from './components/global/device-selector'

const App: React.FC = () => {
  return (
    // <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
    <AuthProvider>
      <ControlLayout>
        <div className="p-2">
          <DeviceSelector />
        </div>
      </ControlLayout>
    </AuthProvider>
    // </ThemeProvider>
  )
}

export default App
