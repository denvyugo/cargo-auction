import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/styles/global.css'
import { AppProviders } from '@/app/providers'

async function enableMocking() {
  if (!import.meta.env.DEV) {
    return
  }

  const { worker } = await import('@/shared/mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

function mountApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  )
}

enableMocking()
  .catch((error) => {
    console.error('Failed to start mock service worker, continuing without it:', error)
  })
  .then(mountApp)
