import "./globals.css";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AppTabBar } from "@/components/ui/app-tabbar";

const montserrat = Montserrat({
  subsets: ["latin"],
})


// const APP_NAME = "Charachat - Chat with your favorite characters";
// const APP_DEFAULT_TITLE = "Charachat - Chat with your favorite characters";
// const APP_TITLE_TEMPLATE = "%s - Charachat - Chat with your favorite characters";
// const APP_DESCRIPTION = "Charachat - Chat with your favorite characters";

// export const metadata: Metadata = {
//   applicationName: APP_NAME,
//   title: {
//     default: APP_DEFAULT_TITLE,
//     template: APP_TITLE_TEMPLATE,
//   },
//   description: APP_DESCRIPTION,
//   manifest: "/manifest.json",
//   appleWebApp: {
//     capable: true,
//     statusBarStyle: "default",
//     title: APP_DEFAULT_TITLE,
//     // startUpImage: [],
//   },
//   formatDetection: {
//     telephone: false,
//   },
//   openGraph: {
//     type: "website",
//     siteName: APP_NAME,
//     title: {
//       default: APP_DEFAULT_TITLE,
//       template: APP_TITLE_TEMPLATE,
//     },
//     description: APP_DESCRIPTION,
//   },
//   twitter: {
//     card: "summary",
//     title: {
//       default: APP_DEFAULT_TITLE,
//       template: APP_TITLE_TEMPLATE,
//     },
//     description: APP_DESCRIPTION,
//   },
// };

// export const viewport: Viewport = {
//   themeColor: "#0a0a0a",
//   maximumScale: 1,
//   userScalable: false,
// };

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html suppressHydrationWarning lang="en" className="h-screen w-screen overflow-hidden">
      <body className={`${montserrat.className} h-screen w-screen overflow-hidden antialiased bg-zinc-50/75 dark:bg-neutral-900/75`} >
        <ThemeProvider
          attribute={"class"}
          defaultTheme={"dark"}
        >
            <main className="relative h-svh overflow-y-hidden overflow-x-hidden w-full ">
              {/* <NextTopLoader showSpinner={false}  />
              <Toaster /> */}
              <AppTabBar />
              {children}
              {/* <svg viewBox="0 0 200 200" className=" fill-zinc-50 dark:fill-stone-700 absolute bottom-[75vh] scale-[300%] blur-3xl -z-10" xmlns="http://www.w3.org/2000/svg">
                <path fill="inherit" opacity={.5} d="M33.5,-24.5C44.3,-13.3,54.3,0.7,55.7,19.8C57,39,49.6,63.3,33.3,72.2C17.1,81.2,-7.9,74.8,-24.4,62.4C-40.9,49.9,-48.9,31.5,-54.9,10.9C-61,-9.7,-65.1,-32.5,-55.6,-43.4C-46.1,-54.3,-23.1,-53.4,-5.8,-48.8C11.4,-44.1,22.8,-35.7,33.5,-24.5Z" transform="translate(100 100)" />
              </svg> */}
            </main>
            
        </ThemeProvider>
      </body>
    </html>
  );
}
