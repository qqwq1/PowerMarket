"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/lib/auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, DollarSign, Eye, Filter } from "lucide-react"

const categoryLabels: Record<string, string> = {
  ALL: "Все категории",
  MANUFACTURING: "Производство",
  EQUIPMENT: "Оборудование",
  WAREHOUSE: "Складские помещения",
  TRANSPORT: "Транспорт",
  LABORATORY: "Лабораторные услуги",
  PROCESSING: "Обработка",
  ASSEMBLY: "Сборка",
  TESTING: "Тестирование",
  OTHER: "Другое",
}

export default function SearchPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [services, setServices] = useState<any[]>([])
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [locationFilter, setLocationFilter] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    loadServices()
  }, [user, token, router])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, categoryFilter, locationFilter, maxPrice, services])

  const loadServices = async () => {
    if (!token) return

    try {
      setLoading(true)
      const data = await api.getServices(token)
      // Only show active services
      const activeServices = data.filter((s: any) => s.active)
      setServices(activeServices)
      setFilteredServices(activeServices)
    } catch (error) {
      console.error("[v0] Failed to load services:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...services]

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (categoryFilter && categoryFilter !== "ALL") {
      filtered = filtered.filter((service) => service.category === categoryFilter)
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter((service) => service.location.toLowerCase().includes(locationFilter.toLowerCase()))
    }

    // Price filter
    if (maxPrice) {
      filtered = filtered.filter((service) => service.pricePerDay <= Number.parseFloat(maxPrice))
    }

    setFilteredServices(filtered)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("ALL")
    setLocationFilter("")
    setMaxPrice("")
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Поиск услуг</h1>
          <p className="text-muted-foreground">Найдите необходимые производственные мощности</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Фильтры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="search">Поиск</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Название или описание..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Локация</Label>
                <Input
                  id="location"
                  placeholder="Город или регион..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPrice">Макс. цена (₽/день)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="100000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Найдено услуг: {filteredServices.length}</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Сбросить фильтры
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <Card key={service.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {categoryLabels[service.category] || service.category}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{service.pricePerDay?.toLocaleString()} ₽/день</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{service.location}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                      <Link href={`/services/${service.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Просмотр
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="flex-1">
                      <Link href={`/rental-requests/new?serviceId=${service.id}`}>Запрос</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Search className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Услуги не найдены</h3>
              <p className="text-muted-foreground text-center mb-6">Попробуйте изменить параметры поиска</p>
              <Button variant="outline" onClick={clearFilters}>
                Сбросить фильтры
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
