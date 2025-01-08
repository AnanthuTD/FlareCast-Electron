import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import WebcamApp from './WebcamApp'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <WebcamApp />
  </React.StrictMode>
)
