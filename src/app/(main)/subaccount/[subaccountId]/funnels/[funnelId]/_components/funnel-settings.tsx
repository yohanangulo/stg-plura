import React from 'react'

import { Funnel, SubAccount } from '@prisma/client'
import db from '@/lib/db'
import { getConnectAccountProducts } from '@/lib/stripe/stripe-actions'

import FunnelForm from '@/components/forms/funnel-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import FunnelProductsTable from './funnel-products-table'
import { getTranslations } from 'next-intl/server'

interface FunnelSettingsProps {
  subaccountId: string
  defaultData: Funnel
}

const FunnelSettings: React.FC<FunnelSettingsProps> = async ({ subaccountId, defaultData }) => {
  //CHALLENGE: go connect your stripe to sell products

  const t = await getTranslations()

  const subaccountDetails = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  })

  if (!subaccountDetails) return
  if (!subaccountDetails.connectAccountId) return
  const products = await getConnectAccountProducts(subaccountDetails.connectAccountId)

  return (
    <div className="flex gap-4 flex-col xl:!flex-row">
      <Card className="flex-1 flex-shrink">
        <CardHeader>
          <CardTitle>{t('funnelProducts')}</CardTitle>
          <CardDescription>{t('selectTheProductsYouWantToSell')}</CardDescription>
        </CardHeader>
        <CardContent>
          <>
            {subaccountDetails.connectAccountId ? (
              <FunnelProductsTable defaultData={defaultData} products={products} />
            ) : (
              t('connectYourStripeAccountToSell')
            )}
          </>
        </CardContent>
      </Card>

      <FunnelForm subAccountId={subaccountId} defaultData={defaultData} />
    </div>
  )
}

export default FunnelSettings
