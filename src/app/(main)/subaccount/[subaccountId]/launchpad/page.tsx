import BlurPage from '@/components/global/blur-page'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import db from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { getStripeOAuthLink } from '@/lib/utils'
import { CheckCircleIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {
  searchParams: {
    state: string
    code: string
  }
  params: { subaccountId: string }
}

const LaunchPad = async ({ params, searchParams }: Props) => {
  const t = await getTranslations()

  const subaccountDetails = await db.subAccount.findUnique({
    where: {
      id: params.subaccountId,
    },
  })

  if (!subaccountDetails) {
    return
  }

  const allDetailsExist =
    subaccountDetails.address &&
    subaccountDetails.subAccountLogo &&
    subaccountDetails.city &&
    subaccountDetails.companyEmail &&
    subaccountDetails.companyPhone &&
    subaccountDetails.country &&
    subaccountDetails.name &&
    subaccountDetails.state

  const stripeOAuthLink = getStripeOAuthLink('subaccount', `launchpad___${subaccountDetails.id}`)

  let connectedStripeAccount = false

  if (searchParams.code) {
    if (!subaccountDetails.connectAccountId) {
      try {
        const response = await stripe.oauth.token({
          grant_type: 'authorization_code',
          code: searchParams.code,
        })
        await db.subAccount.update({
          where: { id: params.subaccountId },
          data: { connectAccountId: response.stripe_user_id },
        })
        connectedStripeAccount = true
      } catch (error) {
        console.log('🔴 Could not connect stripe account', error)
      }
    }
  }

  return (
    <BlurPage>
      <div className="flex flex-col justify-center items-center">
        <div className="w-full h-full max-w-[800px]">
          <Card className="border-none ">
            <CardHeader>
              <CardTitle>{t('letsGetStarted')}</CardTitle>
              <CardDescription>{t('Follow the steps below to get your account setup correctly.')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg ">
                <div className="flex items-center gap-4">
                  <Image src="/appstore.png" alt="App logo" height={80} width={80} className="rounded-md object-contain" />
                  <p>{t('saveWebsiteAsShortcut')}</p>
                </div>
                <Button>{t('start')}</Button>
              </div>
              <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <Image src="/stripelogo.png" alt="App logo" height={80} width={80} className="rounded-md object-contain " />
                  <p>{t('connectYourStripeAccountMessageSubaccount')}</p>
                </div>
                {subaccountDetails.connectAccountId || connectedStripeAccount ? (
                  <CheckCircleIcon size={50} className=" text-primary p-2 flex-shrink-0" />
                ) : (
                  <Link className="bg-primary py-2 px-4 rounded-md text-white" href={stripeOAuthLink}>
                    {t('start')}
                  </Link>
                )}
              </div>
              <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <Image
                    src={subaccountDetails.subAccountLogo}
                    alt="App logo"
                    height={80}
                    width={80}
                    className="rounded-md object-contain p-4"
                  />
                  <p>{t('fillInYourBusinessDetails')}</p>
                </div>
                {allDetailsExist ? (
                  <CheckCircleIcon size={50} className=" text-primary p-2 flex-shrink-0" />
                ) : (
                  <Link
                    className="bg-primary py-2 px-4 rounded-md text-white"
                    href={`/subaccount/${subaccountDetails.id}/settings`}
                  >
                    {t('start')}
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BlurPage>
  )
}

export default LaunchPad
