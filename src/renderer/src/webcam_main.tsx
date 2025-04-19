import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import WebcamApp from './WebcamApp'
import { Toaster } from './components/ui/sonner'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Toaster />
    <WebcamApp />
  </React.StrictMode>
)
