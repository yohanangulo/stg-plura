import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { esES, enUS } from '@clerk/localizations'
import { getLocale } from 'next-intl/server'

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const locale = await getLocale()

  return (
    <ClerkProvider localization={locale === 'en' ? enUS : esES} appearance={{ baseTheme: dark }}>
      {children}
    </ClerkProvider>
  )
}
export default MainLayout
