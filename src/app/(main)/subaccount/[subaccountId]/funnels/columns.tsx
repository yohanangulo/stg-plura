'use client'
/* eslint-disable react-hooks/rules-of-hooks */

import { Badge } from '@/components/ui/badge'
import { FunnelsForSubAccount } from '@/lib/types'
import { ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export const columns: ColumnDef<FunnelsForSubAccount>[] = [
  {
    accessorKey: 'name',
    header: () => useTranslations()('name'),
    cell: ({ row }) => {
      return (
        <Link className="flex gap-2 items-center" href={`/subaccount/${row.original.subAccountId}/funnels/${row.original.id}`}>
          {row.getValue('name')}
          <ExternalLink size={15} />
        </Link>
      )
    },
  },
  {
    accessorKey: 'updatedAt',
    header: () => useTranslations()('lastUpdated'),
    cell: ({ row }) => {
      const date = ` ${row.original.updatedAt.toDateString()} ${row.original.updatedAt.toLocaleTimeString()} `
      return <span className="text-muted-foreground">{date}</span>
    },
  },
  {
    accessorKey: 'published',
    header: () => useTranslations()('status'),
    cell: ({ row }) => {
      const t = useTranslations()

      const status = row.original.published
      return status ? (
        <Badge variant={'default'}>
          {t('live')} - {row.original.subDomainName}
        </Badge>
      ) : (
        <Badge variant={'secondary'}>{t('draft')}</Badge>
      )
    },
  },
]
