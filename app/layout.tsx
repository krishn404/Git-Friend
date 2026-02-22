import type { ReactNode } from "react"
import "@/app/globals.css"
import { Inter, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { GitHubAuthProvider } from "@/context/github-auth-context"
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" })
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"]
})

export const metadata = {
  title: "Git Friend - Make Git Simple Again",
  description:
    "Git Friend simplifies complex Git workflows, making version control intuitive and collaborative for developers of all skill levels.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Git Friend - Make Git Simple Again",
    description:
      "Git Friend simplifies complex Git workflows, making version control intuitive and collaborative for developers of all skill levels.",
    url: "https://gitfriend.vercel.app",
    siteName: "Git Friend",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Git Friend - AI chat for Git and GitHub",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Git Friend - Make Git Simple Again",
    description:
      "Git Friend simplifies complex Git workflows, making version control intuitive and collaborative for developers of all skill levels.",
    images: ["/og.jpg"],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`} suppressHydrationWarning>
        <GitHubAuthProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <Suspense fallback={null}>{children}</Suspense>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
          <Analytics />
        </GitHubAuthProvider>
      </body>
    </html>
  )
}
