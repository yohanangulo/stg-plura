import React from 'react'
import { stripe } from '@/lib/stripe'
import { addOnProducts, pricingCards } from '@/lib/constants'
import db from '@/lib/db'
import { Separator } from '@/components/ui/separator'
import PricingCard from './_components/pricing-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import clsx from 'clsx'
import SubscriptionHelper from './_components/subscription-helper'
import Stripe from 'stripe'
import { PricesList } from '@/lib/types'
import { getTranslations } from 'next-intl/server'

type Props = {
  params: { agencyId: string }
}

const Page = async ({ params }: Props) => {
  const t = await getTranslations()

  //CHALLENGE : Create the add on  products
  // TODO: Create the add on products
  // const addOns = await stripe.products.list({
  //   ids: addOnProducts.map(product => product.id),
  //   expand: ['data.default_price'],
  // })

  const addOns = {
    data: [
      {
        id: '1',
        default_price: {
          unit_amount: 1000,
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
        },
      },
    ],
  }

  const agencySubscription = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    select: {
      // customerId: true,
      Subscription: true,
    },
  })

  // TODO
  // const prices = await stripe.prices.list({
  //   product: process.env.NEXT_PLURA_PRODUCT_ID,
  //   active: true,
  // })

  // prices mock data

  // let a: PricesList['data']

  const currentPlanDetails = pricingCards.find(c => c.priceId === agencySubscription?.Subscription?.priceId)

  // TODO
  // const charges = await stripe.charges.list({
  //   limit: 50,
  //   // customer: agencySubscription?.customerId,
  // })

  // charges mock data
  const charges = {
    data: [
      {
        id: '1',
        amount: 1000,
        description: 'Monthly',
        created: 1666600000,
      },
    ],
  }

  const allCharges = [
    ...charges.data.map(charge => ({
      description: charge.description,
      id: charge.id,
      date: `${new Date(charge.created * 1000).toLocaleTimeString()} ${new Date(charge.created * 1000).toLocaleDateString()}`,
      status: 'Paid',
      amount: `$${charge.amount / 100}`,
    })),
  ]

  return (
    <>
      <SubscriptionHelper
        prices={[] as PricesList['data']}
        // prices={prices.data}
        customerId={''}
        // customerId={agencySubscription?.customerId || ''}
        planExists={agencySubscription?.Subscription?.active === true}
      />
      <h1 className="text-4xl p-4">{t('billing')}</h1>
      <Separator className=" mb-6" />
      <h2 className="text-2xl p-4">{t('currentPlan')}</h2>
      <div className="flex flex-col lg:!flex-row justify-between gap-8">
        <PricingCard
          planExists={agencySubscription?.Subscription?.active === true}
          prices={[] as PricesList['data']}
          // prices={prices.data}
          customerId={''}
          // customerId={agencySubscription?.customerId || ''}
          amt={agencySubscription?.Subscription?.active === true ? currentPlanDetails?.price || '$0' : '$0'}
          buttonCta={agencySubscription?.Subscription?.active === true ? t('changePlan') : t('getStarted')}
          highlightDescription={t('wantToModifyYourPlan')}
          highlightTitle={t('planOptions')}
          description={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.description || t('letsGetStarted')
              : t('letsGetStartedPickAPlanThatWorksForYou')
          }
          duration={t('duration')}
          features={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.features || []
              : currentPlanDetails?.features || pricingCards.find(pricing => pricing.title === 'Starter')?.features || []
          }
          title={agencySubscription?.Subscription?.active === true ? currentPlanDetails?.title || t('starter') : t('starter')}
        />
        {addOns.data.map(addOn => (
          <PricingCard
            planExists={agencySubscription?.Subscription?.active === true}
            prices={[] as PricesList['data']}
            // prices={prices.data}
            customerId={''}
            // customerId={agencySubscription?.customerId || ''}
            key={addOn.id}
            amt={
              //@ts-ignore
              addOn.default_price?.unit_amount
                ? //@ts-ignore
                  `$${addOn.default_price.unit_amount / 100}`
                : '$0'
            }
            buttonCta={t('subscribe')}
            description={t('dedicatedSupport')}
            duration={t('duration')}
            features={[]}
            title={t('24/7PrioritySupport')}
            highlightTitle={t('getSupportNow')}
            highlightDescription={t('getPrioritySupport')}
          />
        ))}
      </div>
      <h2 className="text-2xl p-4">{t('paymentHistory')}</h2>
      <Table className="bg-card border-[1px] border-border rounded-md">
        <TableHeader className="rounded-md">
          <TableRow>
            <TableHead className="w-[200px]">{t('description')}</TableHead>
            <TableHead className="w-[200px]">{t('invoiceId')}</TableHead>
            <TableHead className="w-[300px]">{t('date')}</TableHead>
            <TableHead className="w-[200px]">{t('paid')}</TableHead>
            <TableHead className="text-right">{t('amount')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {allCharges.map(charge => (
            <TableRow key={charge.id}>
              <TableCell>{charge.description}</TableCell>
              <TableCell className="text-muted-foreground">{charge.id}</TableCell>
              <TableCell>{charge.date}</TableCell>
              <TableCell>
                <p
                  className={clsx('', {
                    'text-emerald-500': charge.status.toLowerCase() === 'paid',
                    'text-orange-600': charge.status.toLowerCase() === 'pending',
                    'text-red-600': charge.status.toLowerCase() === 'failed',
                  })}
                >
                  {charge.status.toUpperCase()}
                </p>
              </TableCell>
              <TableCell className="text-right">{charge.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default Page
