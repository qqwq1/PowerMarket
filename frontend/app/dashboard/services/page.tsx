'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import type { Service } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, MapPin, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CATEGORY_LABELS, SERVICE_CATEGORY, ALL_CATEGORY_VALUE } from '@/lib/constants'

export default function ServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>(ALL_CATEGORY_VALUE)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const data = await api.get<Service[]>('/services')
      setServices(data)
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту услугу?')) return

    try {
      await api.delete(`/services/${id}`)
      setServices((prev) => prev.filter((s) => s.id !== id))
    } catch (error) {
      console.error('Ошибка удаления услуги:', error)
      alert('Не удалось удалить услугу')
    }
  }

  const categoryOptions = useMemo(() => SERVICE_CATEGORY.map((value) => ({ value, label: CATEGORY_LABELS[value] })), [])

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase()
    return services.filter((s) => {
      const matchQuery = q
        ? [s.title, s.location, s.description].map((f) => (f ? String(f).toLowerCase() : '')).some((f) => f.includes(q))
        : true
      const matchCategory = category && category !== ALL_CATEGORY_VALUE ? String(s.category) === category : true
      return matchQuery && matchCategory
    })
  }, [services, search, category])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Мои услуги</h1>
          <p className="text-muted-foreground mt-1">Управляйте своими производственными мощностями</p>
        </div>
        <Button onClick={() => router.push('/dashboard/services/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить услугу
        </Button>
      </div>

      <div className="grid items-center gap-4 grid-cols-1 md:grid-cols-4">
        <Input
          placeholder="Поиск услуг..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:col-span-3"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:col-span-1">
            <SelectValue placeholder="Все категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORY_VALUE}>Все категории</SelectItem>
            {categoryOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {services.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Нет услуг</h3>
          <p className="text-muted-foreground mb-6">Начните с добавления вашей первой производственной мощности</p>
          <Button onClick={() => router.push('/dashboard/services/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить услугу
          </Button>
        </Card>
      ) : filteredServices.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
          <p className="text-muted-foreground mb-6">Измените запрос, категорию или сбросьте фильтры</p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => {
                setSearch('')
                setCategory(ALL_CATEGORY_VALUE)
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                {service.title ? (
                  <img src={'/placeholder.svg'} alt={service.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{service.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {service.location}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-muted-foreground">Цена за день</div>
                    <div className="text-lg font-bold text-foreground">
                      {service.pricePerDay.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground">Мощность</div>
                    <div className="font-semibold">
                      {service.availableCapacity} / {service.totalCapacity}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => router.push(`/dashboard/services/${service.id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Изменить
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="w-4 h-4" />
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
