// Created by CaptainCode - FE-3 Specialist
// Main React Entry Point

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AppErrorBoundary } from './shared/components/AppErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
)
