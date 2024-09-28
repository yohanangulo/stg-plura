'use client'

import ContactUserForm from '@/components/forms/contact-user-form'
import CustomModal from '@/components/global/custom-modal'
import { Button } from '@/components/ui/button'
import { useModal } from '@/providers/modal-provider'
import { useTranslations } from 'next-intl'
import React from 'react'

type Props = {
  subaccountId: string
}

const CraeteContactButton = ({ subaccountId }: Props) => {
  const t = useTranslations()
  const { setOpen } = useModal()

  const handleCreateContact = async () => {
    setOpen(
      <CustomModal title="Create Or Update Contact information" subheading="Contacts are like customers.">
        <ContactUserForm subaccountId={subaccountId} />
      </CustomModal>,
    )
  }

  return <Button onClick={handleCreateContact}>{t('createContact')}</Button>
}

export default CraeteContactButton
