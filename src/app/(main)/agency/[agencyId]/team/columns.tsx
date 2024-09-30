'use client'
/* eslint-disable react-hooks/rules-of-hooks */

import clsx from 'clsx'
import { ColumnDef } from '@tanstack/react-table'
import { Agency, AgencySidebarOption, Permissions, Prisma, Role, SubAccount, User } from '@prisma/client'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Badge } from '@/components/ui/badge'
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
import { Button } from '@/components/ui/button'
import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react'
import { useModal } from '@/providers/modal-provider'
import UserDetails from '@/components/forms/user-details'

import { deleteUser, getUser } from '@/lib/queries'
import { useToast } from '@/components/ui/use-toast'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UsersWithAgencySubAccountPermissionsSidebarOptions } from '@/lib/types'
import CustomModal from '@/components/global/custom-modal'
import { useTranslations } from 'next-intl'

export const columns: ColumnDef<UsersWithAgencySubAccountPermissionsSidebarOptions>[] = [
  {
    accessorKey: 'id',
    header: '',
    cell: () => {
      return null
    },
  },
  {
    accessorKey: 'name',
    header: () => useTranslations()('name'),
    cell: ({ row }) => {
      const avatarUrl = row.getValue('avatarUrl') as string
      return (
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 relative flex-none">
            <Image src={avatarUrl} fill className="rounded-full object-cover" alt="avatar image" />
          </div>
          <span>{row.getValue('name')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'avatarUrl',
    header: '',
    cell: () => {
      return null
    },
  },
  { accessorKey: 'email', header: () => useTranslations()('email') },

  {
    accessorKey: 'SubAccount',
    header: () => useTranslations()('ownedAccounts'),
    // header: 'Owned Accounts',
    cell: ({ row }) => {
      const t = useTranslations()

      const isAgencyOwner = row.getValue('role') === 'AGENCY_OWNER'
      const ownedAccounts = row.original?.Permissions.filter(per => per.access)

      if (isAgencyOwner)
        return (
          <div className="flex flex-col items-start">
            <div className="flex flex-col gap-2">
              <Badge className="bg-slate-600 whitespace-nowrap">
                {t('agency')} - {row?.original?.Agency?.name}
              </Badge>
            </div>
          </div>
        )
      return (
        <div className="flex flex-col items-start">
          <div className="flex flex-col gap-2">
            {ownedAccounts?.length ? (
              ownedAccounts.map(account => (
                <Badge key={account.id} className="bg-slate-600 w-fit whitespace-nowrap">
                  {t('subAccount')} - {account.SubAccount.name}
                </Badge>
              ))
            ) : (
              <div className="text-muted-foreground">{t('noAccessYet')}</div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'role',
    header: () => useTranslations()('role'),
    cell: ({ row }) => {
      const role: Role = row.getValue('role')
      return (
        <Badge
          className={clsx({
            'bg-emerald-500': role === 'AGENCY_OWNER',
            'bg-orange-400': role === 'AGENCY_ADMIN',
            'bg-primary': role === 'SUBACCOUNT_USER',
            'bg-muted': role === 'SUBACCOUNT_GUEST',
          })}
        >
          {role}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const rowData = row.original

      return <CellActions rowData={rowData} />
    },
  },
]

interface CellActionsProps {
  rowData: UsersWithAgencySubAccountPermissionsSidebarOptions
}

const CellActions: React.FC<CellActionsProps> = async ({ rowData }) => {
  const t = useTranslations()

  const { data, setOpen } = useModal()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  if (!rowData) return
  if (!rowData.Agency) return

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{t('openMenu')}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
          <DropdownMenuItem className="flex gap-2" onClick={() => navigator.clipboard.writeText(rowData?.email)}>
            <Copy size={15} /> {t('copyEmail')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setOpen(
                <CustomModal subheading={t('youCanChangePermissions')} title={t('editUserDetails')}>
                  <UserDetails type="agency" id={rowData?.Agency?.id || null} subAccounts={rowData?.Agency?.SubAccount} />
                </CustomModal>,
                async () => {
                  return { user: await getUser(rowData?.id) }
                },
              )
            }}
          >
            <Edit size={15} />
            {t('editDetails')}
          </DropdownMenuItem>
          {rowData.role !== 'AGENCY_OWNER' && (
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="flex gap-2" onClick={() => {}}>
                <Trash size={15} /> {t('removeUser')}
              </DropdownMenuItem>
            </AlertDialogTrigger>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">{t('areYouAbsolutelySure')}</AlertDialogTitle>
          <AlertDialogDescription className="text-left">{t('deleteUserConfMessage')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive"
            onClick={async () => {
              setLoading(true)
              await deleteUser(rowData.id)
              toast({
                title: t('deletedUser'),
                description: t('theUserHasBeenDeleted'),
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
