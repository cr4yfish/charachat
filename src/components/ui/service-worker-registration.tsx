'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox
      
      // Add an event listener to detect when the registered
      // service worker has installed but is waiting to activate.
      wb.addEventListener('waiting', () => {
        // Show a prompt asking the user if they want to refresh
        // to update and activate the waiting service worker.
        if (confirm('A new version is available! Refresh to update?')) {
          wb.addEventListener('controlling', () => {
            window.location.reload()
          })
          wb.messageSkipWaiting()
        }
      })

      wb.register()
    }
  }, [])

  return null
}

// Extend the Window interface to include workbox
declare global {
  interface Window {
    workbox: {
      addEventListener: (event: string, callback: () => void) => void
      messageSkipWaiting: () => void
      register: () => void
    }
  }
}
