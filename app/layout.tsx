import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NextUIProvider } from "@nextui-org/system";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar"
import { LeftSidebar } from "@/components/LeftSidebar";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/toaster"
import NavbarServerWrapper from "@/components/NavbarServerWrapper";

const montserrat = Montserrat({
  subsets: ["latin"],
})


const APP_NAME = "Charachat - Chat with your favorite characters";
const APP_DEFAULT_TITLE = "Charachat - Chat with your favorite characters";
const APP_TITLE_TEMPLATE = "%s - Charachat - Chat with your favorite characters";
const APP_DESCRIPTION = "Charachat - Chat with your favorite characters";

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
    statusBarStyle: "default",
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
  themeColor: "#0a0a0a",
  maximumScale: 1,
  userScalable: false,
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black dark h-screen overflow-x-hidden">
      <body
        className={`${montserrat.className} h-screen overflow-x-hidden overflow-y-auto antialiased bg-neutral-900/75`}
      >
        <ThemeProvider
          attribute={"class"}
          defaultTheme={"system"}
          enableSystem
          disableTransitionOnChange
        >
          <NextUIProvider>
            <SidebarProvider>
              <LeftSidebar />
              <NextTopLoader />
              <NavbarServerWrapper />
              <Toaster />
              {children}
            </SidebarProvider>
          </NextUIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
