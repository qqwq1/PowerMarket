'use client'

import { useEffect, useState } from 'react'
import { format, isBefore, startOfDay } from 'date-fns'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { Rental } from '@/types'
import { ru } from 'date-fns/locale'
import urls from '@/components/layout/urls'
import { MainLayout } from '@/components/layout/dashboard-layout'
import { statusColors, statusLabels } from '@/lib/constants'

function RentalDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const rentalId = params.id as string
  const [rental, setRental] = useState<Rental>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    loadRental()
  }, [rentalId])

  const loadRental = async () => {
    try {
      const data = await api.get<Rental>(`/v1/rentals/${rentalId}`)
      setRental(data)
    } catch (error) {
      console.error('Ошибка загрузки заявки:', error)
      alert('Не удалось загрузить заявку')
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      const data = await api.post<Rental>(`/v1/rentals/${rentalId}/approve`)
      setRental(data)
    } catch (error) {
      console.error('Ошибка подтверждения:', error)
      alert('Не удалось подтвердить аренду')
    } finally {
      setConfirming(false)
    }
  }

  const handleStart = async () => {
    setConfirming(true)
    try {
      const data = await api.post<Rental>(`/v1/rentals/${rentalId}/start`)
      setRental(data)
    } catch (error) {
      console.error('Ошибка старта периода:', error)
      alert('Не удалось подтвердить начало периода аренды')
    } finally {
      setConfirming(false)
    }
  }

  const handleComplete = async () => {
    setConfirming(true)
    try {
      const data = await api.post<Rental>(`/v1/rentals/${rentalId}/complete`)
      setRental(data)
    } catch (error) {
      console.error('Ошибка старта периода:', error)
      alert('Не удалось подтвердить начало периода аренды')
    } finally {
      setConfirming(false)
    }
  }

  const canConfirm = () => {
    if (!rental || rental.status !== 'IN_CONTRACT') return false
    if (user?.role === 'SUPPLIER') return !rental.supplierConfirmed
    if (user?.role === 'TENANT') return !rental.tenantConfirmed
    return false
  }

  const canStart = () => {
    if (!rental || rental.status !== 'CONFIRMED' || !rental.startDate) return false
    return (
      !isBefore(new Date(), startOfDay(new Date(rental.startDate))) &&
      rental.supplierConfirmed &&
      rental.tenantConfirmed
    )
  }

  const canComplete = () => {
    if (!rental || rental.status !== 'IN_RENT' || !rental.endDate) return false
    return (
      !isBefore(new Date(), startOfDay(new Date(rental.endDate))) && rental.supplierConfirmed && rental.tenantConfirmed
    )
  }

  const calculateDays = () => {
    if (!rental) return 0
    const start = new Date(rental.startDate)
    const end = new Date(rental.endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (loading || !rental) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{rental.serviceTitle}</h1>
          <p className="text-muted-foreground mt-1">Детали заявки на аренду</p>
        </div>
        <Badge className={statusColors[rental.status]}>{statusLabels[rental.status]}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold">Информация об аренде</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Услуга</span>
                <span className="font-semibold">{rental.serviceTitle}</span>
              </div>

              {user?.role === 'SUPPLIER' && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">
                    {user?.role === 'SUPPLIER' ? 'Арендатор' : 'Арендодатель'}
                  </span>
                  <span className="font-semibold">{rental.tenantName}</span>
                </div>
              )}

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Период аренды</span>
                <span className="font-semibold">
                  {new Date(rental.startDate).toLocaleDateString('ru-RU')} -{' '}
                  {new Date(rental.endDate).toLocaleDateString('ru-RU')}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Количество дней</span>
                <span className="font-semibold">{calculateDays()}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Требуемая мощность</span>
                <span className="font-semibold">{rental.requestedCapacity} единиц</span>
              </div>
              <div className="flex items-center justify-between py-3 text-lg">
                <span className="font-bold">Итого</span>
                <span className="font-bold text-2xl">{rental.totalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </Card>

          {(rental.status === 'IN_CONTRACT' || rental.status === 'CONFIRMED') && (
            <Card className="p-6">
              <h2 className="text-xl font-bold ">Статус подтверждения</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {rental.supplierConfirmed ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-gray-400" />
                    )}
                    <div>
                      <div className="font-semibold">Арендодатель</div>
                      <div className="text-sm text-muted-foreground">{rental.supplierName}</div>
                    </div>
                  </div>
                  <Badge className={rental.supplierConfirmed ? 'bg-green-100 text-green-800' : ''}>
                    {rental.supplierConfirmed ? 'Подтверждено' : 'Ожидает'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {rental.tenantConfirmed ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-gray-400" />
                    )}
                    <div>
                      <div className="font-semibold">Арендатор</div>
                      <div className="text-sm text-muted-foreground">{rental.tenantName}</div>
                    </div>
                  </div>
                  <Badge className={rental.tenantConfirmed ? 'bg-green-100 text-green-800' : ''}>
                    {rental.tenantConfirmed ? 'Подтверждено' : 'Ожидает'}
                  </Badge>
                </div>

                {rental.supplierConfirmed && rental.tenantConfirmed && rental.status === 'CONFIRMED' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="font-semibold text-green-800">Обе стороны подтвердили аренду</div>
                    <div className="text-sm text-green-700 mt-1">{`Одной из сторон необходимо подтвердить начало аренды ${format(
                      new Date(rental.startDate),
                      'd MMM yyyy',
                      { locale: ru }
                    )} или позже`}</div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold">Действия</h3>

            {canConfirm() && (
              <Button className="w-full" onClick={handleConfirm} disabled={confirming}>
                {confirming ? 'Подтверждение...' : 'Подтвердить аренду'}
              </Button>
            )}

            {canStart() && (
              <Button className="w-full" onClick={handleStart} disabled={confirming}>
                {confirming ? 'Подтверждение...' : 'Подтвердить начало аренды'}
              </Button>
            )}

            {canComplete() && (
              <Button className="w-full" onClick={handleComplete} disabled={confirming}>
                {confirming ? 'Подтверждение...' : 'Подтвердить окончание аренды'}
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push(urls.common.chatPage(rental.id))}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Открыть чат
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold">Информация</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Заявка создана: {rental.createdAt ? format(new Date(rental.createdAt), 'MM.dd.yyyy') : '-'}</p>
              {rental.status === 'IN_CONTRACT' && (
                <p className="text-blue-600">Обе стороны должны подтвердить условия аренды для продолжения.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default () => (
  <MainLayout>
    <RentalDetailPage />
  </MainLayout>
)
