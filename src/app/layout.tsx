import type { Metadata } from 'next'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Geist_Mono, Montserrat } from 'next/font/google'
import './globals.css'
import { AppTabBar } from '@/components/ui/tab-bar/app-tabbar'
import { TopBar } from '@/components/ui/top-bar/top-bar'
import { GlobalLiquidFilter } from '@/components/ui/liquid'
import { Toaster } from 'sonner'
import NextTopLoader from 'nextjs-toploader';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const montserrat = Montserrat({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: 'Charachat',
  description: 'Chat with your favorite characters. Free. Open Source. Private.',
}



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className='dark' >
        <body className={`${montserrat.className} ${geistMono.variable} antialiased h-screen overflow-y-hidden`}>
          <Toaster position={"top-center"} />
          <NextTopLoader showSpinner={false} />
          <TopBar />
          <AppTabBar />
          <GlobalLiquidFilter />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}