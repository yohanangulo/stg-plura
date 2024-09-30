'use client'

import React from 'react'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { saveActivityLogsNotification, sendInvitation } from '@/lib/queries'
import { useToast } from '../ui/use-toast'
import { useTranslations } from 'next-intl'

interface SendInvitationProps {
  agencyId: string
}

const SendInvitation: React.FC<SendInvitationProps> = ({ agencyId }) => {
  const t = useTranslations()

  const { toast } = useToast()
  const userDataSchema = z.object({
    email: z.string().email(),
    role: z.enum(['AGENCY_ADMIN', 'SUBACCOUNT_USER', 'SUBACCOUNT_GUEST']),
  })

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      role: 'SUBACCOUNT_USER',
    },
  })

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    try {
      const res = await sendInvitation(values.role, values.email, agencyId)
      await saveActivityLogsNotification({
        agencyId: agencyId,
        description: `Invited | ${res.email}`,
        subaccountId: undefined,
      })
      toast({
        title: t('success'),
        description: t('createdAndSentInvitation'),
      })
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: t('oops'),
        description: t('couldNotSendInvitation'),
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('invitation')}</CardTitle>
        <CardDescription>{t('invitationDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('email')} {...field} />
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
                  <Select onValueChange={value => field.onChange(value)} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AGENCY_ADMIN">{t('agencyAdmin')}</SelectItem>
                      <SelectItem value="SUBACCOUNT_USER">{t('subAccountUser')}</SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">{t('subAccountGuest')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <Loading /> : t('sendInvitation')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default SendInvitation
