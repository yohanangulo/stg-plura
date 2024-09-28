'use client'
import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Stripe from 'stripe'
import Image from 'next/image'
import { saveActivityLogsNotification, updateFunnelProducts } from '@/lib/queries'
import { Funnel } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface FunnelProductsTableProps {
  defaultData: Funnel
  products: Stripe.Product[]
}

const FunnelProductsTable: React.FC<FunnelProductsTableProps> = ({ products, defaultData }) => {
  const t = useTranslations()

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [liveProducts, setLiveProducts] = useState<{ productId: string; recurring: boolean }[] | []>(
    JSON.parse(defaultData.liveProducts || '[]'),
  )

  const handleSaveProducts = async () => {
    setIsLoading(true)
    const response = await updateFunnelProducts(JSON.stringify(liveProducts), defaultData.id)
    await saveActivityLogsNotification({
      agencyId: undefined,
      description: `Update funnel products | ${response.name}`,
      subaccountId: defaultData.subAccountId,
    })
    setIsLoading(false)
    router.refresh()
  }

  const handleAddProduct = async (product: Stripe.Product) => {
    const productIdExists = liveProducts.find(
      //@ts-ignore
      prod => prod.productId === product.default_price.id,
    )
    productIdExists
      ? setLiveProducts(
          liveProducts.filter(
            prod =>
              prod.productId !==
              //@ts-ignore
              product.default_price?.id,
          ),
        )
      : //@ts-ignore
        setLiveProducts([
          ...liveProducts,
          {
            //@ts-ignore
            productId: product.default_price.id as string,
            //@ts-ignore
            recurring: !!product.default_price.recurring,
          },
        ])
  }
  return (
    <>
      <Table className="bg-card border-[1px] border-border rounded-md">
        <TableHeader className="rounded-md">
          <TableRow>
            <TableHead>{t('live')}</TableHead>
            <TableHead>{t('image')}</TableHead>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('interval')}</TableHead>
            <TableHead className="text-right">{t('price')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {products.map(product => (
            <TableRow key={product.id}>
              <TableCell>
                <Input
                  defaultChecked={
                    !!liveProducts.find(
                      //@ts-ignore
                      prod => prod.productId === product.default_price.id,
                    )
                  }
                  onChange={() => handleAddProduct(product)}
                  type="checkbox"
                  className="w-4 h-4"
                />
              </TableCell>
              <TableCell>
                <Image alt="product Image" height={60} width={60} src={product.images[0]} />
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                {
                  //@ts-ignore
                  product.default_price?.recurring ? 'Recurring' : 'One Time'
                }
              </TableCell>
              <TableCell className="text-right">
                $
                {
                  //@ts-ignore
                  product.default_price?.unit_amount / 100
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button disabled={isLoading} onClick={handleSaveProducts} className="mt-4">
        {t('saveProducts')}
      </Button>
    </>
  )
}

export default FunnelProductsTable
