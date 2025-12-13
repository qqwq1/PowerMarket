'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Service } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Package, User } from 'lucide-react'
import { RentalRequestDialog } from '@/components/rental-request-dialog'
import urls from '@/components/layout/urls'
import { MainLayout } from '@/components/layout/dashboard-layout'

const categoryLabels: Record<string, string> = {
  MANUFACTURING: 'Производство',
  LOGISTICS: 'Логистика',
  STORAGE: 'Складирование',
  PROCESSING: 'Обработка',
  ASSEMBLY: 'Сборка',
  PACKAGING: 'Упаковка',
  OTHER: 'Другое',
}

function ServiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const serviceId = params.id as string
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRequestDialog, setShowRequestDialog] = useState(false)

  useEffect(() => {
    loadService()
  }, [serviceId])

  const loadService = useCallback(async () => {
    try {
      const data = await api.get<Service>(`/services/${serviceId}`)
      if (!data.active) {
        router.push(urls.common.main)
        return
      }
      setService(data)
    } catch (error) {
      console.error('Ошибка загрузки услуги:', error)
      alert('Не удалось загрузить услугу')
      router.back()
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading || !service) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад к каталогу
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-muted relative">
              {service ? (
                <img src={'/placeholder.svg'} alt={service.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {service.location}
                    </div>
                    <Badge>{categoryLabels[service.category]}</Badge>
                  </div>
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold mb-2">Описание</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Поставщик:</span>
                <span className="font-medium">{service.supplierName}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6  sticky top-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Цена за день</div>
              <div className="text-3xl font-bold text-foreground">{service.pricePerDay.toLocaleString('ru-RU')} ₽</div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Макс. лимит:</span>
              <span className="font-semibold">{service.maxCapacity}</span>
            </div>

            <Button className="w-full" size="lg" onClick={() => setShowRequestDialog(true)}>
              Отправить заявку
            </Button>

            {user?.role === 'SUPPLIER' && (
              <div className="text-sm text-muted-foreground text-center py-2">
                Вы не можете арендовать как арендодатель
              </div>
            )}
          </Card>
        </div>
      </div>

      {showRequestDialog && (
        <RentalRequestDialog
          service={service}
          onClose={() => setShowRequestDialog(false)}
          onSuccess={(id) => {
            setShowRequestDialog(false)
            router.push(urls.common.detailRentalPage(id))
          }}
        />
      )}
    </div>
  )
}

export default () => (
  <MainLayout>
    <ServiceDetailPage />
  </MainLayout>
)
