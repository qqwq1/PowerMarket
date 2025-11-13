'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { RentalRequest } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Package, CheckCircle, XCircle, Coins } from 'lucide-react'
import { useRouter } from 'next/navigation'

const statusLabels: Record<string, string> = {
  PENDING: 'Ожидает ответа',
  IN_CONTRACT: 'В договоре',
  CONFIRMED: 'Подтверждено',
  IN_RENT: 'В аренде',
  COMPLETED: 'Завершено',
  REJECTED: 'Отклонено',
  CANCELLED: 'Отменено',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_CONTRACT: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  IN_RENT: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

export default function RequestsPage() {
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

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/rental-requests/${id}/approve`, {})
      loadRequests()
    } catch (error) {
      console.error('Ошибка одобрения заявки:', error)
      alert('Не удалось одобрить заявку')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await api.post(`/rental-requests/${id}/reject`, {})
      loadRequests()
    } catch (error) {
      console.error('Ошибка отклонения заявки:', error)
      alert('Не удалось отклонить заявку')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Загрузка...</div>
      </div>
    )
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

                  {/* {(request.status === 'IN_CONTRACT' || request.status === 'CONFIRMED') && (
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center">
                        {request.landlordConfirmed ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400 mr-1" />
                        )}
                        <span className={request.landlordConfirmed ? 'text-green-600' : 'text-muted-foreground'}>
                          Арендодатель
                        </span>
                      </div>
                      <div className="flex items-center">
                        {request.tenantConfirmed ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400 mr-1" />
                        )}
                        <span className={request.tenantConfirmed ? 'text-green-600' : 'text-muted-foreground'}>
                          Арендатор
                        </span>
                      </div>
                    </div>
                  )} */}
                </div>

                <div className="flex flex-col gap-2 md:w-48">
                  {/* {user?.role === 'SUPPLIER' && request.status === 'PENDING' && (
                    <>
                      <Button onClick={() => handleApprove(request.serviceId)} size="sm">
                        Одобрить
                      </Button>
                      <Button variant="outline" onClick={() => handleReject(request.serviceId)} size="sm">
                        Отклонить
                      </Button>
                    </>
                  )} */}

                  {/* {request.status === 'IN_CONTRACT' && (
                    <Button onClick={() => router.push(`/dashboard/rentals/${request.id}`)} size="sm">
                      Подтвердить аренду
                    </Button>
                  )} */}

                  <Button variant="outline" onClick={() => router.push(`/dashboard/chat/${request.id}`)} size="sm">
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
