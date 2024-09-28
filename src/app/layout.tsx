import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'

import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import ModalProvider from '@/providers/modal-provider'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

const font = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Awesome Website Builder',
  description: 'All in one Agency Solution',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${font.className} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ModalProvider>
              {children}
              <Toaster />
              <SonnerToaster />
            </ModalProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
