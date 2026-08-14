import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import '@fontsource/manrope/800.css'
import './index.css'
import App from './App.jsx'
import { ThemeModeProvider } from './theme/ThemeModeContext'
import { ToastProvider } from './components/ToastProvider'
import { AuthProvider } from './auth/AuthProvider'
import { FirmProvider } from './firm/FirmProvider'

// FirmProvider sits inside AuthProvider because it only fetches once a session
// exists, and inside BrowserRouter is unnecessary — neither provider routes.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeModeProvider>
      <ToastProvider>
        <AuthProvider>
          <FirmProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </FirmProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeModeProvider>
  </StrictMode>,
)
