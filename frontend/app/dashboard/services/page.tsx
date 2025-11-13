"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import type { Service } from "@/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Edit, Trash2, MapPin, Package } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ServicesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const data = await api.get<Service[]>("/services")
      setServices(data)
    } catch (error) {
      console.error("Ошибка загрузки услуг:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту услугу?")) return

    try {
      await api.delete(`/services/${id}`)
      setServices(services.filter((s) => s.id !== id))
    } catch (error) {
      console.error("Ошибка удаления услуги:", error)
      alert("Не удалось удалить услугу")
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Мои услуги</h1>
          <p className="text-muted-foreground mt-1">Управляйте своими производственными мощностями</p>
        </div>
        <Button onClick={() => router.push("/dashboard/services/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить услугу
        </Button>
      </div>

      {services.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Нет услуг</h3>
          <p className="text-muted-foreground mb-6">Начните с добавления вашей первой производственной мощности</p>
          <Button onClick={() => router.push("/dashboard/services/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить услугу
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                {service.title ? (
                  <img
                    src={"/placeholder.svg"}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
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
                      {service.pricePerDay.toLocaleString("ru-RU")} ₽
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
