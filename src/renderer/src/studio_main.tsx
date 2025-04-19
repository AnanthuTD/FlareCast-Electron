import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import StudioApp from './StudioApp'
import { Toaster } from './components/ui/sonner'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Toaster />
    <StudioApp />
  </React.StrictMode>
)
