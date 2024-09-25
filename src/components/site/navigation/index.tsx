import { ModeToggle } from '@/components/global/mode-toggle'
import { UserButton } from '@clerk/nextjs'
import { User } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  user?: User | null
}

const Navigation = ({ user }: Props) => {
  return (
    <div className="p-4 flex items-center justify-between relative">
      <aside className="flex items-center gap-2">
        <Image src="/assets/plura-logo.svg" alt="logo" width={40} height={40} className="rounded" />
        <span className="text-xl font-bold">DreamTeam</span>
      </aside>
      <nav className="hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
        <ul className="flex items-center justify-center gap-8">
          <li>
            <Link href="#">Pricing</Link>
          </li>
          <li>
            <Link href="#">About</Link>
          </li>
          <li>
            <Link href="#">Documentation</Link>
          </li>
          <li>
            <Link href="#">Features</Link>
          </li>
        </ul>
      </nav>
      <aside className="flex gap-2 items-center">
        <Link href="/agency" className="bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80 transition-all">
          Login
        </Link>
        <UserButton />
        <ModeToggle />
      </aside>
    </div>
  )
}
export default Navigation
