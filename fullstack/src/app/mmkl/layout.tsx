import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import '@/styles/mmkl.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MMKL — Dashboard',
  description: 'Everything we\'ve built — games, tools, and apps in one cinematic place.',
}

export default function MmklLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`mmkl-root ${syne.variable} ${dmSans.variable}`}>
      {children}
    </div>
  )
}
