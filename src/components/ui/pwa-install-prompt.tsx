'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkStandalone = () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             'standalone' in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone ||
             document.referrer.includes('android-app://')
    }

    setIsStandalone(checkStandalone())

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Don't show immediately, wait a bit for better UX
      setTimeout(() => {
        if (!checkStandalone()) {
          setShowPrompt(true)
        }
      }, 3000)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Store dismissal in localStorage to avoid showing again for a while
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Don't show if already installed or dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const dayInMs = 24 * 60 * 60 * 1000
      if (Date.now() - dismissedTime < dayInMs * 7) { // Don't show for 7 days after dismissal
        setShowPrompt(false)
      }
    }
  }, [])

  if (!showPrompt || !deferredPrompt || isStandalone) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardContent className="p-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDismiss}
            className='absolute top-2 right-2 rounded-full'
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">Install Charachat</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Install our app for a better experience with offline access and faster loading.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="flex-1"
                >
                  Install
                </Button>

              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
