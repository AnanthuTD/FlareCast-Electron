import React from 'react'
import { AuthProvider } from './providers/AuthProvider'
import ControlLayout from './layouts/ControlLayout'
import DeviceSelector from './components/global/device-selector'
import { Toaster } from 'sonner'

const App: React.FC = () => {
  return (
    <>
      {/* <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme"> */}
      <AuthProvider>
        <ControlLayout>
          <div className="p-2">
            <DeviceSelector />
          </div>
        </ControlLayout>
      </AuthProvider>
      <Toaster />
      {/* </ThemeProvider> */}
    </>
  )
}

export default App
