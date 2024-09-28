import CircleProgress from '@/components/global/circle-progress'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import db from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { AreaChart } from '@tremor/react'
import { ClipboardIcon, Contact2, DollarSign, Goal, ShoppingCart } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import React from 'react'

const Page = async ({ params }: { params: { agencyId: string }; searchParams: { code: string } }) => {
  const t = await getTranslations()

  let currency = 'USD'
  let sessions
  let totalClosedSessions
  let totalPendingSessions
  let net = 0
  let potentialIncome = 0
  let closingRate = 0
  const currentYear = new Date().getFullYear()
  const startDate = new Date(`${currentYear}-01-01T00:00:00Z`).getTime() / 1000
  const endDate = new Date(`${currentYear}-12-31T23:59:59Z`).getTime() / 1000

  const agencyDetails = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
  })

  if (!agencyDetails) return

  const subaccounts = await db.subAccount.findMany({
    where: {
      agencyId: params.agencyId,
    },
  })

  if (agencyDetails.connectAccountId) {
    const response = await stripe.accounts.retrieve({
      stripeAccount: agencyDetails.connectAccountId,
    })

    currency = response.default_currency?.toUpperCase() || 'USD'
    const checkoutSessions = await stripe.checkout.sessions.list(
      {
        created: { gte: startDate, lte: endDate },
        limit: 100,
      },
      { stripeAccount: agencyDetails.connectAccountId },
    )
    sessions = checkoutSessions.data
    totalClosedSessions = checkoutSessions.data
      .filter(session => session.status === 'complete')
      .map(session => ({
        ...session,
        created: new Date(session.created).toLocaleDateString(),
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
      }))

    totalPendingSessions = checkoutSessions.data
      .filter(session => session.status === 'open')
      .map(session => ({
        ...session,
        created: new Date(session.created).toLocaleDateString(),
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
      }))
    net = +totalClosedSessions.reduce((total, session) => total + (session.amount_total || 0), 0).toFixed(2)

    potentialIncome = +totalPendingSessions.reduce((total, session) => total + (session.amount_total || 0), 0).toFixed(2)

    closingRate = +((totalClosedSessions.length / checkoutSessions.data.length) * 100).toFixed(2)
  }

  return (
    <div className="relative h-full">
      {/* // TODO: */}
      {/* {!agencyDetails.connectAccountId && (
        <div className=" absolute -top-10 -left-10 right-0 bottom-0 z-30 flex items-center justify-center backdrop-blur-md bg-background/50">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Stripe</CardTitle>
              <CardDescription>You need to connect your stripe account to see metrics</CardDescription>
              <Link
                href={`/agency/${agencyDetails.id}/launchpad`}
                className="p-2 w-fit bg-secondary text-white rounded-md flex items-center gap-2"
              >
                <ClipboardIcon />
                Launch Pad
              </Link>
            </CardHeader>
          </Card>
        </div>
      )} */}
      <h1 className="text-4xl">{'Dashboard'}</h1>
      <Separator className=" my-6" />
      <div className="flex flex-col gap-4 pb-6">
        <div className="flex gap-4 flex-col xl:!flex-row">
          <Card className="flex-1 relative">
            <CardHeader>
              <CardDescription>{t('income')}</CardDescription>
              <CardTitle className="text-4xl">{net ? `${currency} ${net.toFixed(2)}` : `$0.00`}</CardTitle>
              <small className="text-xs text-muted-foreground">
                {t('forTheYear')} {currentYear}
              </small>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{t('totalRenevueGeneratedAsStripeDashboard')}</CardContent>
            <DollarSign className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
          <Card className="flex-1 relative">
            <CardHeader>
              <CardDescription>{t('pontentialIncome')}</CardDescription>
              <CardTitle className="text-4xl">
                {potentialIncome ? `${currency} ${potentialIncome.toFixed(2)}` : `$0.00`}
              </CardTitle>
              <small className="text-xs text-muted-foreground">
                {t('forTheYear')} {currentYear}
              </small>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{t('thisIsHowMuchYouCanClose')}</CardContent>
            <DollarSign className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
          <Card className="flex-1 relative">
            <CardHeader>
              <CardDescription>{t('activeClients')}</CardDescription>
              <CardTitle className="text-4xl">{subaccounts.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t('reflectsTheNumberOfSubAccountsYouOwnAndManage')}
            </CardContent>
            <Contact2 className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
          <Card className="flex-1 relative">
            <CardHeader>
              <CardTitle>{t('agencyGoal')}</CardTitle>
              <CardDescription>
                <p className="mt-2">{t('agencyGoalDescription')}</p>
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">
                    {t('current')}: {subaccounts.length}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {t('goal')}: {agencyDetails.goal}
                  </span>
                </div>
                <Progress value={(subaccounts.length / agencyDetails.goal) * 100} />
              </div>
            </CardFooter>
            <Goal className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
        </div>
        <div className="flex gap-4 xl:!flex-row flex-col">
          <Card className="p-4 flex-1">
            <CardHeader>
              <CardTitle>{t('transactionHistoy')}</CardTitle>
            </CardHeader>
            <AreaChart
              className="text-sm stroke-primary"
              data={[...(totalClosedSessions || []), ...(totalPendingSessions || [])]}
              index="created"
              categories={['amount_total']}
              colors={['primary']}
              yAxisWidth={30}
              showAnimation={true}
            />
          </Card>
          <Card className="xl:w-[400px] w-full">
            <CardHeader>
              <CardTitle>{t('conversions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CircleProgress
                value={closingRate}
                description={
                  <>
                    {sessions && (
                      <div className="flex flex-col">
                        {t('abandoned')}
                        <div className="flex gap-2">
                          <ShoppingCart className="text-rose-700" />
                          {sessions.length}
                        </div>
                      </div>
                    )}
                    {totalClosedSessions && (
                      <div className="felx flex-col">
                        {t('wonCarts')}
                        <div className="flex gap-2">
                          <ShoppingCart className="text-emerald-700" />
                          {totalClosedSessions.length}
                        </div>
                      </div>
                    )}
                  </>
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Page
