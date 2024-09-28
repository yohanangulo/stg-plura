'use client'

import { deleteSubAccount, getSubaccountDetails, saveActivityLogsNotification } from '@/lib/queries'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import React from 'react'

type Props = {
  subaccountId: string
}

const DeleteButton = ({ subaccountId }: Props) => {
  const t = useTranslations()

  const router = useRouter()

  return (
    <div
      className="text-white"
      onClick={async () => {
        const response = await getSubaccountDetails(subaccountId)
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Deleted a subaccount | ${response?.name}`,
          subaccountId,
        })
        await deleteSubAccount(subaccountId)
        router.refresh()
      }}
    >
      {t('deleteSubAccount')}
    </div>
  )
}

export default DeleteButton
