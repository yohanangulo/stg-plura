import { GetMediaFiles } from '@/lib/types'
import React from 'react'
import MediaUploadButton from './upload-buttons'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import MediaCard from './media-card'
import { FolderSearch } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Props = {
  data: GetMediaFiles
  subaccountId: string
}

const MediaComponent = ({ data, subaccountId }: Props) => {
  const t = useTranslations()

  return (
    <div className="flex flex-col gap-4 h-full w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl">{t('mediaBucket')}</h1>
        <MediaUploadButton subaccountId={subaccountId} />
      </div>
      <Command className="bg-transparent">
        <CommandInput placeholder="Search for file name..." />
        <CommandList className="pb-40 max-h-full ">
          <CommandEmpty>{t('noMediaFiles')}</CommandEmpty>
          <CommandGroup heading={t('mediaFiles')}>
            <div className="flex flex-wrap gap-4 pt-4">
              {data?.Media.map(file => (
                <CommandItem
                  key={file.id}
                  className="p-0 max-w-[300px] w-full rounded-lg !bg-transparent !font-medium !text-white"
                >
                  <MediaCard file={file} />
                </CommandItem>
              ))}
              {!data?.Media.length && (
                <div className="flex items-center justify-center w-full flex-col">
                  <FolderSearch size={200} className="dark:text-muted text-slate-300" />
                  <p className="text-muted-foreground ">{t('noMediaFilesToShow')}</p>
                </div>
              )}
            </div>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}

export default MediaComponent
