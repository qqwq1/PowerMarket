'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Service, Review, Page } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Star, Package, User } from 'lucide-react'
import { RentalRequestDialog } from '@/components/rental-request-dialog'

const categoryLabels: Record<string, string> = {
  MANUFACTURING: 'Производство',
  LOGISTICS: 'Логистика',
  STORAGE: 'Складирование',
  PROCESSING: 'Обработка',
  ASSEMBLY: 'Сборка',
  PACKAGING: 'Упаковка',
  OTHER: 'Другое',
}

export default function ServiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const serviceId = params.id as string
  const [service, setService] = useState<Service | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestDialog, setShowRequestDialog] = useState(false)

  useEffect(() => {
    loadService()
    loadReviews()
  }, [serviceId])

  useEffect(() => {
    if (service && !service.active && user?.role === 'TENANT') {
      router.push('/dashboard')
    }
  }, [service, user, router])

  const loadService = useCallback(async () => {
    try {
      const data = await api.get<Service>(`/services/${serviceId}`)
      setService(data)
    } catch (error) {
      console.error('Ошибка загрузки услуги:', error)
      alert('Не удалось загрузить услугу')
      router.back()
    } finally {
      setLoading(false)
    }
  }, [])

  const loadReviews = async () => {
    try {
      const data = await api.get<Page<Review>>(`/reviews/service/${serviceId}`)
      setReviews(data.content)
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error)
      setReviews([])
    }
  }

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

              {/* {service.averageRating && service.averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-5 h-5 ${
                                    star <= Math.round(service.averageRating!)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                }`}
                            />
                        ))}
                      </div>
                      <span className="font-semibold">{service.averageRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({service.totalReviews} отзывов)</span>
                    </div>
                )} */}

              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold mb-2">Описание</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Поставщик:</span>
                <span className="font-medium">{service.supplierName}</span>
                {/* {service.supplier?.averageRating && service.supplier.averageRating > 0 && (
                  <div className="flex items-center gap-1 ml-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{service.supplier.averageRating.toFixed(1)}</span>
                  </div>
                )} */}
              </div>
            </div>
          </Card>

          {reviews.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Отзывы</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">{review.reviewer?.companyName || review.reviewer?.name}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}
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
          onSuccess={(rentalRequestId) => {
            setShowRequestDialog(false)
            router.push(`/dashboard/chat/${rentalRequestId}`)
          }}
        />
      )}
    </div>
  )
}
