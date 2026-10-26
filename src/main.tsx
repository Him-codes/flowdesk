import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { clearLegacyStorage } from './utils/storage'
import './styles/tokens.css'
import './styles/global.css'

clearLegacyStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
