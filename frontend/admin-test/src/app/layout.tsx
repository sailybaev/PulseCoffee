import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Pulse Coffee - Admin Test Interface',
  description: 'Complete test interface for Pulse Coffee management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {children}
      </body>
    </html>
  )
}
