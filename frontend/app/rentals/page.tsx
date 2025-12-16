'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { Rental, RentalRequest } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Package, Coins } from 'lucide-react'
import { useRouter } from 'next/navigation'
import urls from '@/components/layout/urls'
import { MainLayout } from '@/components/layout/dashboard-layout'
import { statusColors, statusLabels } from '@/lib/constants'

function RequestsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<RentalRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const endpoint = user?.role === 'SUPPLIER' ? '/rental-requests/received' : '/rental-requests/sent'
      const data = await api.get<RentalRequest[]>(endpoint)
      setRequests(data)
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (id: string, approved: boolean) => {
    try {
      await api.post(`/v1/rental-requests/${id}/respond`, {
        approved,
      })
      loadRequests()
    } catch (error) {
      console.error('Ошибка одобрения заявки:', error)
      alert('Не удалось одобрить заявку')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  const navigateToChatPage = async (id: Rental['id']) => {
    try {
      const data = await api.get<Rental>(`/v1/rentals/${id}`)
      router.push(urls.common.chatPage(data.chatId))
    } catch (error) {
      console.error('Ошибка загрузки заявки:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {user?.role === 'SUPPLIER' ? 'Входящие заявки' : 'Мои заявки'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === 'SUPPLIER' ? 'Заявки на аренду ваших мощностей' : 'Ваши заявки на аренду мощностей'}
        </p>
      </div>

      {requests.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Нет заявок</h3>
          <p className="text-muted-foreground">
            {user?.role === 'SUPPLIER' ? 'Пока нет входящих заявок на аренду' : 'Вы еще не создали ни одной заявки'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{request.serviceTitle}</h3>
                      <Badge className={statusColors[request.status]}>{statusLabels[request.status]}</Badge>
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm">
                    {user?.role === 'SUPPLIER' && (
                      <div className="flex items-center text-muted-foreground">
                        <User className="w-4 h-4 mr-2" />
                        {`Арендатор: ${request.tenantName || request.tenantEmail}`}
                      </div>
                    )}
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {`${new Date(request.startDate).toLocaleDateString('ru-RU')} - ${new Date(
                        request.endDate
                      ).toLocaleDateString('ru-RU')}`}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Package className="w-4 h-4 mr-2" />
                      Мощность: {request.capacityNeeded} единиц
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Coins className="w-4 h-4 mr-2" />
                      Общая стоимость: {request.totalPrice}₽
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:w-48">
                  {user?.role === 'SUPPLIER' && request.status === 'PENDING' && (
                    <>
                      <Button onClick={() => handleRespond(request.id, true)} size="sm">
                        Одобрить
                      </Button>
                      <Button variant="outline" onClick={() => handleRespond(request.id, false)} size="sm">
                        Отклонить
                      </Button>
                    </>
                  )}

                  <Button
                    variant={request.status === 'IN_CONTRACT' ? 'default' : 'outline'}
                    onClick={() => router.push(urls.common.detailRentalPage(request.rentalId))}
                    size="sm"
                  >
                    {request.status === 'IN_CONTRACT' ? 'Подтвердить аренду' : 'Подробнее'}
                  </Button>

                  <Button variant="outline" onClick={() => navigateToChatPage(request.rentalId)} size="sm">
                    Открыть чат
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default () => (
  <MainLayout>
    <RequestsPage />
  </MainLayout>
)
