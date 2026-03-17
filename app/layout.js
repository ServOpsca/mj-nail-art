import './globals.css'

export const metadata = {
  title: 'MJ Nail Art | Professional Manicure & Art',
  description: 'Custom nail art and luxury manicures in a minimalist studio setting.',
  icons: { icon: '/icon.png' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}