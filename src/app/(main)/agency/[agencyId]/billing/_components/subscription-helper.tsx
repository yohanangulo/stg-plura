'use client'
import SubscriptionFormWrapper from '@/components/forms/subscription-form/subscription-form-wrapper'
import CustomModal from '@/components/global/custom-modal'
import { PricesList } from '@/lib/types'
import { useModal } from '@/providers/modal-provider'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

type Props = {
  prices: PricesList['data']
  customerId: string
  planExists: boolean
}

const SubscriptionHelper = ({ customerId, planExists, prices }: Props) => {
  const t = useTranslations()

  const { setOpen } = useModal()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')

  useEffect(() => {
    if (plan)
      setOpen(
        <CustomModal title={t('upgradeYourPlan')} subheading={t('upgradeYourPlanSubHeading')}>
          <SubscriptionFormWrapper planExists={planExists} customerId={customerId} />
        </CustomModal>,
        async () => ({
          plans: {
            defaultPriceId: plan ? plan : '',
            plans: prices,
          },
        }),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan])

  // eslint-disable-next-line i18next/no-literal-string
  return <div>SubscriptionHelper</div>
}

export default SubscriptionHelper
