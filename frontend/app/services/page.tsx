'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/lib/api'
import type { Page, Service } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, MapPin, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CATEGORY_LABELS, ALL_CATEGORY_VALUE, CATEGORIES } from '@/lib/constants'
import urls from '@/components/layout/urls'
import { MainLayout } from '@/components/layout/dashboard-layout'
import { Spinner } from '@/components/ui/spinner'

type ServicesLoaderProps = {
  variant?: 'full' | 'inline'
  message?: string
}

function ServicesLoader({ variant = 'full', message = 'Загружаем ваши услуги...' }: ServicesLoaderProps) {
  const containerClasses =
    variant === 'full'
      ? 'flex flex-col items-center justify-center min-h-[400px] gap-4 text-muted-foreground'
      : 'flex flex-col items-center justify-center gap-3 text-muted-foreground py-10'
  const spinnerSize = variant === 'full' ? 'size-10' : 'size-6'

  return (
    <div className={containerClasses}>
      <Spinner className={spinnerSize} />
      <p className="text-sm">{message}</p>
    </div>
  )
}

function ServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>(ALL_CATEGORY_VALUE)
  const [pagination, setPagination] = useState({ page: 0, size: 9 })
  const [isRefetching, setIsRefetching] = useState(false)
  const hasLoadedOnce = useRef(false)

  useEffect(() => {
    let isMounted = true

    const loadServices = async () => {
      if (!hasLoadedOnce.current) {
        setLoading(true)
      } else {
        setIsRefetching(true)
      }

      const params = new URLSearchParams()
      const trimmedKeyword = search.trim()

      if (trimmedKeyword) {
        params.set('keyword', trimmedKeyword)
      }

      if (category && category !== ALL_CATEGORY_VALUE) {
        params.set('category', category)
      }

      const pageValue = pagination.page.toString()
      const sizeValue = pagination.size.toString()

      params.set('page', pageValue)
      params.set('size', sizeValue)
      params.set('pageable.page', pageValue)
      params.set('pageable.size', sizeValue)

      const queryString = params.toString()
      const endpoint = queryString ? `/v1/services/search?${queryString}` : '/v1/services/search'

      try {
        const data = await api.get<Page<Service>>(endpoint)
        if (!isMounted) return
        setServices(Array.isArray(data?.content) ? data.content : [])
        hasLoadedOnce.current = true
      } catch (error) {
        if (!isMounted) return
        console.error('Ошибка загрузки услуг:', error)
      } finally {
        if (!isMounted) return
        setLoading(false)
        setIsRefetching(false)
      }
    }

    loadServices()

    return () => {
      isMounted = false
    }
  }, [category, pagination.page, pagination.size, search])

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту услугу?')) return

    try {
      await api.delete(`/services/${id}`)
      setServices((prev) => prev.filter((s) => s.id !== id))
    } catch (error) {
      console.error('Ошибка удаления услуги:', error)
      alert('Не удалось удалить услугу')
    }
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPagination((prev) => ({ ...prev, page: 0 }))
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setPagination((prev) => ({ ...prev, page: 0 }))
  }

  const handleResetFilters = () => {
    setSearch('')
    setCategory(ALL_CATEGORY_VALUE)
    setPagination((prev) => ({ ...prev, page: 0 }))
  }

  const categoryOptions = useMemo(() => CATEGORIES.map((value) => ({ value, label: CATEGORY_LABELS[value] })), [])
  const activeServices = useMemo(() => services.filter((service) => service.active), [services])
  const hasFiltersApplied = Boolean(search.trim() || category !== ALL_CATEGORY_VALUE)
  const noServicesAvailable = services.length === 0
  const nothingFound = !noServicesAvailable && activeServices.length === 0

  if (loading) {
    return <ServicesLoader />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Мои услуги</h1>
          <p className="text-muted-foreground mt-1">Управляйте своими производственными мощностями</p>
        </div>
        <Button onClick={() => router.push(urls.supplier.servicesCreate)}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить услугу
        </Button>
      </div>

      <div className="grid items-center gap-4 grid-cols-1 md:grid-cols-4">
        <Input
          placeholder="Поиск услуг..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full md:col-span-3"
        />
        <Select value={category} onValueChange={handleCategoryChange}>
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

      <div className="relative">
        {isRefetching && !loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <ServicesLoader variant="inline" message="Обновляем список услуг..." />
          </div>
        )}

        {noServicesAvailable ? (
          hasFiltersApplied ? (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
              <p className="text-muted-foreground mb-6">Измените запрос, категорию или сбросьте фильтры</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleResetFilters}>Сбросить фильтры</Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Нет услуг</h3>
              <p className="text-muted-foreground mb-6">Начните с добавления вашей первой производственной мощности</p>
              <Button onClick={() => router.push(urls.supplier.servicesCreate)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить услугу
              </Button>
            </Card>
          )
        ) : nothingFound ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
            <p className="text-muted-foreground mb-6">Измените запрос, категорию или сбросьте фильтры</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleResetFilters}>Сбросить фильтры</Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeServices.map((service) => (
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
                      <div className="text-muted-foreground">Макс. лимит</div>
                      <div className="font-semibold">{service.maxCapacity}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => router.push(urls.supplier.servicesEdit(service.id))}
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
    </div>
  )
}

export default () => (
  <MainLayout>
    <ServicesPage />
  </MainLayout>
)
