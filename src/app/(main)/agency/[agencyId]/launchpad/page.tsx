import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import db from '@/lib/db'
// import { getStripeOAuthLink } from '@/lib/utils'
import { CheckCircleIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { stripe } from '@/lib/stripe'
import { getTranslations } from 'next-intl/server'

type Props = {
  params: {
    agencyId: string
  }
  searchParams: { code: string }
}

const LaunchPadPage = async ({ params, searchParams }: Props) => {
  const t = await getTranslations()

  const agencyDetails = await db.agency.findUnique({
    where: { id: params.agencyId },
  })

  if (!agencyDetails) return

  const allDetailsExist =
    agencyDetails.address &&
    agencyDetails.address &&
    agencyDetails.agencyLogo &&
    agencyDetails.city &&
    agencyDetails.companyEmail &&
    agencyDetails.companyPhone &&
    agencyDetails.country &&
    agencyDetails.name &&
    agencyDetails.state &&
    agencyDetails.zipCode

  // TODO
  // const stripeOAuthLink = getStripeOAuthLink('agency', `launchpad___${agencyDetails.id}`)

  let connectedStripeAccount = false

  if (searchParams.code) {
    if (!agencyDetails.connectAccountId) {
      try {
        const response = await stripe.oauth.token({
          grant_type: 'authorization_code',
          code: searchParams.code,
        })
        await db.agency.update({
          where: { id: params.agencyId },
          data: { connectAccountId: response.stripe_user_id },
        })
        connectedStripeAccount = true
      } catch (error) {
        console.log('🔴 Could not connect stripe account')
      }
    }
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full h-full max-w-[800px]">
        <Card className="border-none">
          <CardHeader>
            <CardTitle>{t('letsGetStarted')}</CardTitle>
            <CardDescription>{t('followStepsBellowToGetAccount')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image src="/appstore.png" alt="app logo" height={80} width={80} className="rounded-md object-contain" />
                <p>{t('saveWebsiteAsShortcut')}</p>
              </div>
              <Button>{t('start')}</Button>
            </div>
            <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image src="/stripelogo.png" alt="app logo" height={80} width={80} className="rounded-md object-contain" />
                <p>{t('connectYourStripeAccountToAcceptPayments')}</p>
              </div>
              {agencyDetails.connectAccountId || connectedStripeAccount ? (
                <CheckCircleIcon size={50} className=" text-primary p-2 flex-shrink-0" />
              ) : (
                <Link className="bg-primary py-2 px-4 rounded-md text-white" href={'#'}>
                  {
                    // TODO: add stripe oauth link
                  }
                  {t('start')}
                </Link>
              )}
            </div>
            <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image
                  src={agencyDetails.agencyLogo}
                  alt="app logo"
                  height={80}
                  width={80}
                  className="rounded-md object-contain"
                />
                <p>{t('fillInYourBusinessDetails')}</p>
              </div>
              {allDetailsExist ? (
                <CheckCircleIcon size={50} className="text-primary p-2 flex-shrink-0" />
              ) : (
                <Link className="bg-primary py-2 px-4 rounded-md text-white" href={`/agency/${params.agencyId}/settings`}>
                  {t('start')}
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LaunchPadPage
