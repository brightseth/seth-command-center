import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Seth Command Center',
  description: 'Ritual-driven personal intelligence platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-helvetica bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}