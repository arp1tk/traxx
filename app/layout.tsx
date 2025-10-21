import type { Metadata } from 'next'
import { Inter, Orbitron, Audiowide, Exo_2 } from 'next/font/google'
import './globals.css'

// Configure your fonts
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
})

const audiowide = Audiowide({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-audiowide',
})

const exo = Exo_2({ 
  subsets: ['latin'],
  variable: '--font-exo',
})

export const metadata: Metadata = {
  title: 'Traxx - Music Battle Arena',
  description: 'Battle with your favorite tracks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${audiowide.variable} ${exo.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}