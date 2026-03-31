import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/lib/i18n/LangContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'ميدي كونيكت | MediConnect',
  description: 'منصة الرعاية الصحية الرقمية | Digital Healthcare Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <LangProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  )
}
