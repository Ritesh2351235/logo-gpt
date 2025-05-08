import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { Playfair_Display } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegistration from './service-worker-registration'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  display: 'swap',
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'LogoGPT - AI Logo Generator | Create Professional Logos Instantly',
  description: 'Create stunning, professional logos in seconds with LogoGPT. Our AI-powered logo generator helps businesses and creators design unique logos without design skills.',
  metadataBase: new URL('https://www.logogpt.fun'),
  keywords: ['logo generator', 'AI logo', 'logo design', 'logo maker', 'branding', 'LogoGPT', 'AI-powered logos'],
  authors: [{ name: 'LogoGPT' }],
  creator: 'LogoGPT',
  publisher: 'LogoGPT',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.logogpt.fun',
    title: 'LogoGPT - AI Logo Generator | Create Professional Logos Instantly',
    description: 'Create stunning, professional logos in seconds with LogoGPT. Our AI-powered logo generator helps businesses and creators design unique logos without design skills.',
    siteName: 'LogoGPT',
    images: [
      {
        url: 'https://www.logogpt.fun/logo.png',
        width: 1200,
        height: 630,
        alt: 'LogoGPT - AI Logo Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LogoGPT - AI Logo Generator | Create Professional Logos Instantly',
    description: 'Create stunning, professional logos in seconds with LogoGPT. Our AI-powered logo generator helps businesses and creators design unique logos without design skills.',
    images: ['https://www.logogpt.fun/logo.png'],
  },
  alternates: {
    canonical: 'https://www.logogpt.fun',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable}`}>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#ffffff" />
          <link rel="icon" href="/logo.png" />
          <link rel="apple-touch-icon" href="/logo.png" />
        </head>
        <body className="antialiased">
          <ServiceWorkerRegistration />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
