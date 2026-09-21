import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { TraceLetters } from './TraceLetters.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TraceLetters />
  </StrictMode>,
)
