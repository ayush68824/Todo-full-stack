import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: { default: '#f4f6fa' },
  },
})

const GOOGLE_CLIENT_ID = '665955875780-4956p9i9u01rqi0rhmqe7nnge992mbpc.apps.googleusercontent.com'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <GoogleOAuthProvider 
          clientId={GOOGLE_CLIENT_ID}
          onScriptLoadSuccess={() => {
            console.log('Google OAuth script loaded successfully')
          }}
          onScriptLoadError={() => {
            console.error('Google OAuth script failed to load')
          }}
        >
          <AuthProvider>
            <App />
            <ToastContainer 
              position="top-right" 
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </AuthProvider>
        </GoogleOAuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </StrictMode>,
)
