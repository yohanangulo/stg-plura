'use client'

import { Media } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Copy, MoreHorizontal, Trash } from 'lucide-react'
import Image from 'next/image'
import { deleteMedia, saveActivityLogsNotification } from '@/lib/queries'
import { toast } from '../ui/use-toast'
import { useTranslations } from 'next-intl'

type Props = { file: Media }

const MediaCard = ({ file }: Props) => {
  const t = useTranslations()

  const [loading, setLoading] = useState(false)
  const router = useRouter()

  return (
    <AlertDialog>
      <DropdownMenu>
        <article className="border w-full rounded-lg bg-slate-900">
          <div className="relative w-full h-40">
            <Image src={file.link} alt="preview image" fill className="object-cover rounded-lg" />
          </div>
          <p className="opacity-0 h-0 w-0">{file.name}</p>
          <div className="p-4 relative">
            <p className="text-muted-foreground">{file.createdAt.toDateString()}</p>
            <p>{file.name}</p>
            <div className="absolute top-4 right-4 p-[1px] cursor-pointer ">
              <DropdownMenuTrigger>
                <MoreHorizontal />
              </DropdownMenuTrigger>
            </div>
          </div>

          <DropdownMenuContent>
            <DropdownMenuLabel>{t('menu')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex gap-2"
              onClick={() => {
                navigator.clipboard.writeText(file.link)
                toast({ title: t('copiedToClipboard') })
              }}
            >
              <Copy size={15} /> {t('copyImageLink')}
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="flex gap-2">
                <Trash size={15} /> {t('deleteFile')}
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </article>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">{t('areYouAbsolutelySure')}</AlertDialogTitle>
          <AlertDialogDescription className="text-left">{t('deleteFileConfMessage')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive mb-2"
            onClick={async () => {
              setLoading(true)
              const response = await deleteMedia(file.id)
              await saveActivityLogsNotification({
                agencyId: undefined,
                description: `Deleted a media file | ${response?.name}`,
                subaccountId: response.subAccountId,
              })
              toast({
                title: t('deletedFile'),
                description: t('successfullyDeleted'),
              })
              setLoading(false)
              router.refresh()
            }}
          >
            {t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default MediaCard
