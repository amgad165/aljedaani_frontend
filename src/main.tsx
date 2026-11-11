import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config'
import App from './App.tsx'
import { enforceBuildDomain } from './license/buildGuard'

// Per-client build lock: a domain-pinned build refuses to run elsewhere.
enforceBuildDomain()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
