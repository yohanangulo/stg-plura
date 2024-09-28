import LanguageSwitcher from '@/components/global/language-switcher'
import { ModeToggle } from '@/components/global/mode-toggle'
import { UserButton } from '@clerk/nextjs'
import { User } from '@clerk/nextjs/server'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  user?: User | null
}

const Navigation = ({ user }: Props) => {
  const t = useTranslations()

  return (
    <div className="p-4 flex items-center justify-between relative">
      <aside className="flex items-center gap-2">
        <Image src="/assets/plura-logo.svg" alt="logo" width={40} height={40} className="rounded" />
        <span className="text-xl font-bold">{'2 Sto'}</span>
      </aside>
      <nav className="hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
        <ul className="flex items-center justify-center gap-8">
          <li>
            <Link href="#">{t('pricing')}</Link>
          </li>
          <li>
            <Link href="#">{t('about')}</Link>
          </li>
          <li>
            <Link href="#">{t('documentation')}</Link>
          </li>
          <li>
            <Link href="#"> {t('features')} </Link>
          </li>
        </ul>
      </nav>
      <aside className="flex gap-2 items-center">
        <Link href="/agency" className="bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80 transition-all">
          {t('login')}
        </Link>
        <UserButton />
        <ModeToggle />
        <LanguageSwitcher />
      </aside>
    </div>
  )
}
export default Navigation
