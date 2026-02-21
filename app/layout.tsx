import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GridShield OS — Grid Stress Simulator',
  description: 'AI-assisted real-time power grid stress simulator and cascade failure prevention dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full w-full overflow-hidden">
      <body className="h-full w-full overflow-hidden bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  )
}
