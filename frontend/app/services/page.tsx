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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Factory, Plus, Search, MoreVertical, Edit, Trash2, Eye } from "lucide-react"

const categoryLabels: Record<string, string> = {
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

export default function ServicesPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [services, setServices] = useState<any[]>([])
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    if (user.role !== "SUPPLIER") {
      router.push("/dashboard")
      return
    }

    loadServices()
  }, [user, token, router])

  useEffect(() => {
    if (searchQuery) {
      setFilteredServices(
        services.filter(
          (service) =>
            service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.location.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    } else {
      setFilteredServices(services)
    }
  }, [searchQuery, services])

  const loadServices = async () => {
    if (!token) return

    try {
      setLoading(true)
      const data = await api.getServices(token)
      setServices(data)
      setFilteredServices(data)
    } catch (error) {
      console.error("[v0] Failed to load services:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!token || !confirm("Вы уверены, что хотите удалить эту услугу?")) return

    try {
      await api.deleteService(token, id)
      setServices(services.filter((s) => s.id !== id))
    } catch (error) {
      console.error("[v0] Failed to delete service:", error)
      alert("Не удалось удалить услугу")
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Мои услуги</h1>
            <p className="text-muted-foreground">Управляйте своими производственными мощностями</p>
          </div>
          <Button asChild>
            <Link href="/services/new">
              <Plus className="mr-2 h-4 w-4" />
              Добавить услугу
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск услуг..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Services Grid */}
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
              <Card key={service.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {categoryLabels[service.category] || service.category}
                        </Badge>
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/services/${service.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Просмотр
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/services/${service.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(service.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{service.description}</p>
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Цена:</span>
                      <span className="font-semibold">{service.pricePerDay?.toLocaleString()} ₽/день</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Локация:</span>
                      <span className="font-medium">{service.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Статус:</span>
                      <Badge variant={service.active ? "default" : "secondary"}>
                        {service.active ? "Активна" : "Неактивна"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Factory className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">{searchQuery ? "Услуги не найдены" : "Нет услуг"}</h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchQuery ? "Попробуйте изменить параметры поиска" : "Начните с добавления вашей первой услуги"}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/services/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить услугу
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
