import Image from 'next/image'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { pricingCards } from '@/lib/constants'
import clsx from 'clsx'
import { Check } from 'lucide-react'
import Link from 'next/link'

import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations()

  return (
    <>
      <section className="h-full w-full pt-36 relative flex items-center flex-col">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <p className="text-center">{t('runYourAgency')}</p>
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
          <h1 className="text-9xl font-bold text-center md:text-[300px]">{t('2Sto')}</h1>
        </div>
        <div className="flex justify-center items-center relative md:mt-[-70px]">
          <Image
            src="/assets/preview.png"
            alt="Preview"
            width={1200}
            height={1200}
            className="rounded-tl-2xl rounded-tr-2xl border-2 border-muted"
          />
          <div className="bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"></div>
        </div>
      </section>
      <section className="flex flex-col justify-center items-center gap-4 md:mt-20 mt-40 pb-40">
        <h2 className="text-4xl text-center">{t('chooseWhatFitsYouRight')}</h2>
        <p className="text-muted-foreground text-center">
          {t('straightforwardPricing')} <br /> {t('straightforwardPricing2')}
        </p>
        <div className="flex justify-center gap-4 flex-wrap mt-6 ">
          {pricingCards.map(card => (
            // TODO: wire up free product from string

            <Card
              key={card.title}
              className={clsx('w-[300px] flex flex-col justify-between', {
                'border-2 border-primary': card.title === 'Unlimited Saas',
              })}
            >
              <CardHeader>
                <CardTitle
                  className={clsx('', {
                    'text-muted-foreground': card.title !== 'Unlimited Saas',
                  })}
                >
                  {t(card.title)}
                </CardTitle>
                <CardDescription>{t(card.description)}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-4xl font-bold">{card.price}</span>
                <span>{'/m'}</span>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div>
                  {card.features.map(feature => (
                    <div key={feature} className="flex gap-2 items-center">
                      <Check className="text-muted-foreground" />
                      <p>{t(feature)}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/agency/?plan=${card.priceId}`}
                  className={clsx('w-full text-center bg-primary p-2 rounded-md', {
                    '!bg-muted-foreground': card.title !== 'Unlimited Saas',
                  })}
                >
                  {t('getStarted')}
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </>
  )
}
