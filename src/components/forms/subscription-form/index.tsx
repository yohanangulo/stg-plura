'use client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Plan } from '@prisma/client'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useTranslations } from 'next-intl'
import React, { use, useState } from 'react'

type Props = {
  selectedPriceId: string | Plan
}

const SubscriptionForm = ({ selectedPriceId }: Props) => {
  const t = useTranslations()

  const { toast } = useToast()
  const elements = useElements()
  const stripeHook = useStripe()
  const [priceError, setPriceError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (!selectedPriceId) {
      setPriceError(t('youNeedToSelectAPlanToSubscribe'))
      return
    }
    setPriceError('')
    event.preventDefault()
    if (!stripeHook || !elements) return

    try {
      const { error } = await stripeHook.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_URL}/agency`,
        },
      })
      if (error) {
        throw new Error()
      }
      toast({
        title: t('paymentSuccessfully'),
        description: t('yourPaymentHasBeenSuccessfully'),
      })
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: t('paymentFailed'),
        description: t('weCouldntProcessYourPaymentPleaseTryADifferentCard'),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <small className="text-destructive">{priceError}</small>
      <PaymentElement />
      <Button disabled={!stripeHook} className="mt-4 w-full">
        {t('submit')}
      </Button>
    </form>
  )
}
export default SubscriptionForm
