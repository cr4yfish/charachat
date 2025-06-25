'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { usePWAInstall } from '@/hooks/use-pwa-install'

interface PWAInstallButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function PWAInstallButton({ variant = 'default', size = 'default', className }: PWAInstallButtonProps) {
  const { isInstallable, isStandalone, promptInstall } = usePWAInstall()

  if (!isInstallable || isStandalone) {
    return null
  }

  const handleInstall = async () => {
    await promptInstall()
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleInstall}
    >
      <Download className="w-4 h-4 mr-2" />
      Install App
    </Button>
  )
}
