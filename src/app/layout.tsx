import type { Metadata, Viewport } from 'next'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Geist_Mono, Montserrat, Leckerli_One } from 'next/font/google'
import './globals.css'
import { AppTabBar } from '@/components/ui/tab-bar/app-tabbar'
import { TopBar } from '@/components/ui/top-bar/top-bar'
import { GlobalLiquidFilter } from '@/components/ui/liquid'
import { Toaster } from 'sonner'
import NextTopLoader from 'nextjs-toploader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/ui/app-sidebar'
import { PWAInstallPrompt } from '@/components/ui/pwa-install-prompt'
import { ServiceWorkerRegistration } from '@/components/ui/service-worker-registration'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: '--font-montserrat',
  display: 'swap',
})

const leckerliOne = Leckerli_One({
  weight: "400",
  subsets: ["latin"],
  variable: '--font-leckerli-one',
  display: 'swap',
  fallback: ['cursive'],
})

const APP_NAME = "Charachat";
const APP_DEFAULT_TITLE = "Charachat - Private AI Character Chat Platform";
const APP_TITLE_TEMPLATE = "%s - Charachat";
const APP_DESCRIPTION = "Chat privately with AI characters using your choice of 10+ AI providers. Featuring strong AES-256 encryption, open-source transparency, and complete data privacy. No vendor lock-in, no data selling.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#020618",
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className='dark' >
        
        <body className={`${montserrat.className} ${geistMono.variable} ${leckerliOne.variable} antialiased h-screen overflow-hidden`}>
          <SidebarProvider>
            <AppSidebar />
            <TopBar />
            <SidebarInset>
              <ServiceWorkerRegistration />
              <Toaster position={"top-center"} />
              <NextTopLoader color='#00a6f4' showSpinner={false} />
              <AppTabBar />
              <GlobalLiquidFilter />
              {children}
              <PWAInstallPrompt />
            </SidebarInset>
          </SidebarProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}