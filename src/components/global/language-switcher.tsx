'use client'

import { Globe } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { setUserLocale } from '@/i18n/actions'
import { useTranslations } from 'next-intl'

const LanguageSwitcher = () => {
  const t = useTranslations()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('changeLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem onClick={() => setUserLocale('es')}>{'Es'}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setUserLocale('en')}>{'En'}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
export default LanguageSwitcher
