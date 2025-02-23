import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import PlausibleProvider from 'next-plausible'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FormEase',
  description: 'AI Form Builder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <PlausibleProvider domain={process.env.PLAUSIBLE_DOMAIN || ""} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
