import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sudoku - لعبة سودوكو',
  description: 'لعبة سودوكو كلاسيكية على الهاتف',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
