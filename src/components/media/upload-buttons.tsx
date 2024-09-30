'use client'

import { useModal } from '@/providers/modal-provider'
import React from 'react'
import { Button } from '../ui/button'
import CustomModal from '../global/custom-modal'
import UploadMediaForm from '../forms/upload-media'
import { useTranslations } from 'next-intl'

type Props = {
  subaccountId: string
}

const MediaUploadButton = ({ subaccountId }: Props) => {
  const t = useTranslations()

  const { isOpen, setOpen, setClose } = useModal()

  return (
    <Button
      onClick={() => {
        setOpen(
          <CustomModal title={t('uploadMedia')} subheading={t('uploadFileToMedia')}>
            <UploadMediaForm subaccountId={subaccountId}></UploadMediaForm>
          </CustomModal>,
        )
      }}
    >
      {t('upload')}
    </Button>
  )
}

export default MediaUploadButton
