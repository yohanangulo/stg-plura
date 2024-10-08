'use client'

import { AuthUserWithAgencySigebarOptionsSubAccounts, UserWithPermissionsAndSubAccounts } from '@/lib/types'
import { useModal } from '@/providers/modal-provider'
import { SubAccount, User } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import {
  changeUserPermissions,
  getAuthUserDetails,
  getUserPermissions,
  saveActivityLogsNotification,
  updateUser,
} from '@/lib/queries'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import FileUpload from '../global/file-upload'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { v4 } from 'uuid'
import { useTranslations } from 'next-intl'

type Props = {
  id: string | null
  type: 'agency' | 'subaccount'
  userData?: Partial<User>
  subAccounts?: SubAccount[]
}

const UserDetails = ({ id, type, subAccounts, userData }: Props) => {
  const t = useTranslations()

  const [subAccountPermissions, setSubAccountsPermissions] = useState<UserWithPermissionsAndSubAccounts | null>(null)

  const { data, setClose } = useModal()
  const [roleState, setRoleState] = useState('')
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [authUserData, setAuthUserData] = useState<AuthUserWithAgencySigebarOptionsSubAccounts | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  //Get authUSerDtails

  useEffect(() => {
    if (data.user) {
      const fetchDetails = async () => {
        const response = await getAuthUserDetails()
        if (response) setAuthUserData(response)
      }
      fetchDetails()
    }
  }, [data])

  const userDataSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    avatarUrl: z.string(),
    role: z.enum(['AGENCY_OWNER', 'AGENCY_ADMIN', 'SUBACCOUNT_USER', 'SUBACCOUNT_GUEST']),
  })

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: 'onChange',
    defaultValues: {
      name: userData ? userData.name : data?.user?.name,
      email: userData ? userData.email : data?.user?.email,
      avatarUrl: userData ? userData.avatarUrl : data?.user?.avatarUrl,
      role: userData ? userData.role : data?.user?.role,
    },
  })

  useEffect(() => {
    if (!data.user) return
    const getPermissions = async () => {
      if (!data.user) return
      const permission = await getUserPermissions(data.user.id)
      setSubAccountsPermissions(permission)
    }
    getPermissions()
  }, [data, form])

  useEffect(() => {
    if (data.user) {
      form.reset(data.user)
    }
    if (userData) {
      form.reset(userData)
    }
  }, [userData, data, form])

  const onChangePermission = async (subAccountId: string, val: boolean, permissionsId: string | undefined) => {
    if (!data.user?.email) return
    setLoadingPermissions(true)
    const response = await changeUserPermissions(permissionsId ? permissionsId : v4(), data.user.email, subAccountId, val)
    if (type === 'agency') {
      await saveActivityLogsNotification({
        agencyId: authUserData?.Agency?.id,
        description: `Access given | ${userData?.name} -> ${
          subAccountPermissions?.Permissions.find(p => p.subAccountId === subAccountId)?.SubAccount.name
        }`,
        subaccountId: subAccountPermissions?.Permissions.find(p => p.subAccountId === subAccountId)?.SubAccount.id,
      })
    }

    if (response) {
      toast({
        title: t('success'),
        description: t('theRequestWasSuccessful'),
      })
      if (subAccountPermissions) {
        subAccountPermissions.Permissions.find(perm => {
          if (perm.subAccountId === subAccountId) {
            return { ...perm, access: !perm.access }
          }
          return perm
        })
      }
    } else {
      toast({
        variant: 'destructive',
        title: t('oops'),
        description: t('couldNotUpdatePermissions'),
      })
    }
    router.refresh()
    setLoadingPermissions(false)
  }

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    if (!id) return
    if (userData || data?.user) {
      const updatedUser = await updateUser(values)
      authUserData?.Agency?.SubAccount.filter(subacc =>
        authUserData.Permissions.find(p => p.subAccountId === subacc.id && p.access),
      ).forEach(async subaccount => {
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Updated information | ${userData?.name}`,
          subaccountId: subaccount.id,
        })
      })

      if (updatedUser) {
        toast({
          title: t('success'),
          description: t('updatedUserInformation'),
        })
        setClose()
        router.refresh()
      } else {
        toast({
          variant: 'destructive',
          title: t('oops'),
          description: t('couldNotUpdateUserInformation'),
        })
      }
    } else {
      console.log('Error could not submit')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('userDetails')}</CardTitle>
        <CardDescription>{t('addOrUpdateYourInfo')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profilePicture')}</FormLabel>
                  <FormControl>
                    <FileUpload apiEndpoint="avatar" value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('userFullName')}</FormLabel>
                  <FormControl>
                    <Input required placeholder={t('fullName')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={userData?.role === 'AGENCY_OWNER' || form.formState.isSubmitting}
                      placeholder={t('email')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('userRole')}</FormLabel>
                  <Select
                    disabled={field.value === 'AGENCY_OWNER'}
                    onValueChange={value => {
                      if (value === 'SUBACCOUNT_USER' || value === 'SUBACCOUNT_GUEST') {
                        setRoleState(t('youNeedToHaveSubAccountsToAssign'))
                      } else {
                        setRoleState('')
                      }
                      field.onChange(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AGENCY_ADMING">{t('agencyAdmin')}</SelectItem>
                      {(data?.user?.role === 'AGENCY_OWNER' || userData?.role === 'AGENCY_OWNER') && (
                        <SelectItem value="AGENCY_OWNER">{t('agencyOwner')}</SelectItem>
                      )}
                      <SelectItem value="SUBACCOUNT_USER">{t('subAccountUser')}</SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">{t('subAccountGuest')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground">{roleState}</p>
                </FormItem>
              )}
            />

            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <Loading /> : t('saveUserDetails')}
            </Button>
            {authUserData?.role === 'AGENCY_OWNER' && (
              <div>
                <Separator className="my-4" />
                <FormLabel>{t('userPermissions')}</FormLabel>
                <FormDescription className="mb-4">{t('userPermissionsDesc')}</FormDescription>
                <div className="flex flex-col gap-4">
                  {subAccounts?.map(subAccount => {
                    const subAccountPermissionsDetails = subAccountPermissions?.Permissions.find(
                      p => p.subAccountId === subAccount.id,
                    )
                    return (
                      <div key={subAccount.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p>{subAccount.name}</p>
                        </div>
                        <Switch
                          disabled={loadingPermissions}
                          checked={subAccountPermissionsDetails?.access}
                          onCheckedChange={permission => {
                            onChangePermission(subAccount.id, permission, subAccountPermissionsDetails?.id)
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default UserDetails
