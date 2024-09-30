import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

import Navigation from '@/components/site/navigation'
import { esES, enUS } from '@clerk/localizations'
import { getLocale } from 'next-intl/server'

const SiteLayout = async ({ children }: { children: React.ReactNode }) => {
  const locale = await getLocale()

  return (
    <ClerkProvider localization={locale === 'en' ? enUS : esES} appearance={{ baseTheme: dark }}>
      <main className="min-h-full">
        <Navigation />
        {children}
      </main>
    </ClerkProvider>
  )
}

export default SiteLayout
