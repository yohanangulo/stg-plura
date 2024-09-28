import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

const Unauthorized = () => {
  const t = useTranslations()

  return (
    <div className="p-4 text-center h-screen w-screen flex justify-center items-center flex-col">
      <h1 className="text-3xl md:text-6xl">{t('unauthorizedAccess')}</h1>
      <p>{t('pleaseContactToGetAccess')}</p>
      <Link href="/" className="mt-4 bg-primary p-2">
        {t('backToHome')}
      </Link>
    </div>
  )
}

export default Unauthorized
