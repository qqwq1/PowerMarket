'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Service } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Star, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CATEGORY_LABELS, SERVICE_CATEGORY } from '@/lib/constants'

export default function BrowsePage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [searchQuery, selectedCategory, services])

  const loadServices = async () => {
    try {
      const data = await api.get<Service[]>('/services')
      setServices(data)
      setFilteredServices(data)
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterServices = () => {
    let filtered = services

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter((s) => s.category === selectedCategory)
    }

    setFilteredServices(filtered)
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
        <h1 className="text-3xl font-bold text-foreground">Каталог услуг</h1>
        <p className="text-muted-foreground mt-1">Найдите подходящие производственные мощности для аренды</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию, описанию или местоположению..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-48"
          >
            <option value="ALL">Все категории</option>
            {SERVICE_CATEGORY.map((key) => (
              <option key={key} value={key}>
                {CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {filteredServices.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Услуги не найдены</h3>
          <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/browse/${service.id}`)}
            >
              <div className="aspect-video bg-muted relative">
                {service ? (
                  <img src={'/placeholder.svg'} alt={service.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-background/90 text-foreground">{CATEGORY_LABELS[service.category]}</Badge>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1 line-clamp-1">{service.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {service.location}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Цена за день</div>
                    <div className="text-xl font-bold text-foreground">
                      {service.pricePerDay.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Доступно</div>
                    <div className="font-semibold text-green-600">
                      {service.availableCapacity} / {service.totalCapacity}
                    </div>
                  </div>
                </div>

                {service.averageRating && service.averageRating > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{service.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({service.totalReviews} отзывов)</span>
                  </div>
                )}

                <Button className="w-full" onClick={() => router.push(`/dashboard/browse/${service.id}`)}>
                  Подробнее
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
