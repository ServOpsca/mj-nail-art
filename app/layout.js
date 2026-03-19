import './globals.css'
import { Cormorant_Garamond, Jost } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata = {
  title: 'MJ Nail Art | Luxury Manicure & Design Studio',
  description: 'Bespoke nail artistry crafted for the modern woman. Custom nail art and luxury manicures in Toronto.',
  icons: { icon: '/icon.png' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} dark`}>
      <body className={jost.className}>{children}</body>
    </html>
  )
}
