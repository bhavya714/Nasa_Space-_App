import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NASA Bioscience Explorer | AI-Powered Research Dashboard',
  description: 'Explore NASA bioscience research with AI-powered insights, knowledge graphs, and interactive visualizations for space exploration planning.',
  keywords: 'NASA, bioscience, space exploration, AI, knowledge graph, research dashboard',
  authors: [{ name: 'NASA Bioscience Explorer Team' }],
  openGraph: {
    title: 'NASA Bioscience Explorer',
    description: 'AI-powered dashboard for NASA bioscience research',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-space-900 text-white antialiased`}>
        <div className="min-h-screen bg-space-gradient">
          {children}
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1E293B',
              color: '#F8FAFC',
              border: '1px solid #334155',
            },
          }}
        />
      </body>
    </html>
  )
}
