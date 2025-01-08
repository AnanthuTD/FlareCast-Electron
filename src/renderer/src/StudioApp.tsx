import React from 'react'
import { ThemeProvider } from './providers/theme-provider'
import StudioTray from './components/global/studio-tray'

const StudioApp: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <StudioTray />
    </ThemeProvider>
  )
}

export default StudioApp
