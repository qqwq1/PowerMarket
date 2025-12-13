'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { Review, Page } from '@/types'
import { Card } from '@/components/ui/card'
import { Star, UserIcon, Mail, Building, Award } from 'lucide-react'
import { MainLayout } from '@/components/layout/dashboard-layout'

function ProfilePage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({
    totalRentals: 0,
    activeRentals: 0,
    completedRentals: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const [reviewsData, statsData] = await Promise.all([
        api.get<Page<Review>>(`/reviews/user`),
        api.get<any>('/rentals/stats'),
      ])
      setReviews(reviewsData.content) // Extract content array from Page
      setStats(statsData)
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error)
      setReviews([])
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Профиль</h1>
        <p className="text-muted-foreground mt-1">Информация о вашем аккаунте и статистика</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-foreground">{stats.totalRentals}</div>
          <div className="text-sm text-muted-foreground mt-1">Всего аренд</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.activeRentals}</div>
          <div className="text-sm text-muted-foreground mt-1">Активных</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-foreground">{stats.completedRentals}</div>
          <div className="text-sm text-muted-foreground mt-1">Завершено</div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">Информация о компании</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Название компании</div>
              <div className="font-semibold">{user?.companyName || 'Не указано'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UserIcon className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Контактное лицо</div>
              <div className="font-semibold">{user?.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-semibold">{user?.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Роль</div>
              <div className="font-semibold">{user?.role === 'SUPPLIER' ? 'Арендодатель' : 'Арендатор'}</div>
            </div>
          </div>

          {user?.averageRating && user.averageRating > 0 && (
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <div>
                <div className="text-sm text-muted-foreground">Средняя оценка</div>
                <div className="font-semibold">{user.averageRating.toFixed(1)} / 5.0</div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default () => (
  <MainLayout>
    <ProfilePage />
  </MainLayout>
)
