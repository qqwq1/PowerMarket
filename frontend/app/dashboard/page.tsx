'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Factory, TrendingUp, MessageSquare, Star, Package, FileText, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Service, RentalRequest } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    activeRentals: 0,
    totalRevenue: 0,
    unreadMessages: 0,
  })
  const [recentServices, setRecentServices] = useState<Service[]>([])
  const [recentRequests, setRecentRequests] = useState<RentalRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsData, servicesData, requestsData] = await Promise.all([
        api.get<any>('/rentals/stats'),
        user?.role === 'SUPPLIER' ? api.get<Service[]>('/services') : api.get<Service[]>('/services'),
        user?.role === 'SUPPLIER'
          ? api.get<RentalRequest[]>('/rental-requests/received')
          : api.get<RentalRequest[]>('/rental-requests/sent'),
      ])

      setStats(statsData)
      setRecentServices(servicesData.slice(0, 3))
      setRecentRequests(requestsData.slice(0, 5))
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
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
        <h1 className="text-3xl font-bold">Добро пожаловать, {user?.companyName || user?.email}</h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === 'SUPPLIER'
            ? 'Управляйте своими производственными мощностями и заявками на аренду'
            : 'Просматривайте доступные мощности и управляйте своими арендами'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Активные аренды</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRentals}</div>
            <p className="text-xs text-muted-foreground">Сейчас активны</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('ru-RU')} ₽</div>
            <p className="text-xs text-muted-foreground">За все время</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Сообщения</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Непрочитанных</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Рейтинг</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.averageRating?.toFixed(1) || '—'}</div>
            <p className="text-xs text-muted-foreground">Средняя оценка</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{user?.role === 'SUPPLIER' ? 'Мои услуги' : 'Популярные услуги'}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(user?.role === 'SUPPLIER' ? '/dashboard/services' : '/dashboard/browse')}
              >
                Все
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentServices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {user?.role === 'SUPPLIER' ? 'Нет услуг' : 'Нет доступных услуг'}
              </div>
            ) : (
              <div className="space-y-3">
                {recentServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() =>
                      router.push(
                        user?.role === 'SUPPLIER'
                          ? `/dashboard/services/${service.id}/edit`
                          : `/dashboard/browse/${service.id}`
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <div className="font-semibold">{service.title}</div>
                        <div className="text-sm text-muted-foreground">{service.location}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{service.pricePerDay.toLocaleString('ru-RU')} ₽</div>
                      <div className="text-sm text-muted-foreground">
                        {service.availableCapacity}/{service.totalCapacity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{user?.role === 'SUPPLIER' ? 'Последние заявки' : 'Мои заявки'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/requests')}>
                Все
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Нет заявок</div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/rentals/${request.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <div className="font-semibold">{request.serviceTitle}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(request.startDate).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          request.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'IN_CONTRACT'
                            ? 'bg-blue-100 text-blue-800'
                            : request.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {request.status === 'PENDING'
                          ? 'Ожидает'
                          : request.status === 'IN_CONTRACT'
                          ? 'В договоре'
                          : request.status === 'CONFIRMED'
                          ? 'Подтверждено'
                          : request.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
