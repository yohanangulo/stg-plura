'use client'
import React from 'react'
import PipelineInfobar from './pipeline-infobar'
import { Pipeline } from '@prisma/client'
import CreatePipelineForm from '@/components/forms/create-pipeline-form'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deletePipeline } from '@/lib/queries'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

const PipelineSettings = ({
  pipelineId,
  subaccountId,
  pipelines,
}: {
  pipelineId: string
  subaccountId: string
  pipelines: Pipeline[]
}) => {
  const t = useTranslations()

  const router = useRouter()
  return (
    <AlertDialog>
      <div>
        <div className="flex items-center justify-between mb-4">
          <AlertDialogTrigger asChild>
            <Button variant={'destructive'}>{t('deletePipeline')}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('areYouAbsolutelySure')}</AlertDialogTitle>
              <AlertDialogDescription>{t('deletePipelineConfigMessage')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="items-center">
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    await deletePipeline(pipelineId)
                    //Challenge: Activity log
                    toast({
                      title: 'Deleted',
                      description: 'Pipeline is deleted',
                    })
                    router.replace(`/subaccount/${subaccountId}/pipelines`)
                  } catch (error) {
                    toast({
                      variant: 'destructive',
                      title: 'Oppse!',
                      description: 'Could Delete Pipeline',
                    })
                  }
                }}
              >
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </div>

        <CreatePipelineForm subAccountId={subaccountId} defaultData={pipelines.find(p => p.id === pipelineId)} />
      </div>
    </AlertDialog>
  )
}

export default PipelineSettings
