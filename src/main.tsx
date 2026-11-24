import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/rajdhani/400.css'
import '@fontsource/rajdhani/500.css'
import '@fontsource/rajdhani/600.css'
import '@fontsource/rajdhani/700.css'
import '@fontsource/orbitron/500.css'
import '@fontsource/orbitron/700.css'
import '@fontsource/orbitron/900.css'
import './index.css'
import App from './App'
import { useAuth } from './store/auth'
import { hideNativeSplash, initNativeChrome } from './lib/native'

void useAuth.getState().init()
void initNativeChrome()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// Fade the native splash once the first paint is queued.
requestAnimationFrame(() => requestAnimationFrame(hideNativeSplash))
