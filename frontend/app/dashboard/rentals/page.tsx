"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import type { Rental } from "@/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Package, User, Star } from "lucide-react"
import { useRouter } from "next/navigation"

const statusLabels: Record<string, string> = {
  ACTIVE: "Активна",
  COMPLETED: "Завершена",
  CANCELLED: "Отменена",
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default function RentalsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRentals()
  }, [])

  const loadRentals = async () => {
    try {
      const data = await api.get<Rental[]>("/rentals/my")
      setRentals(data)
    } catch (error) {
      console.error("Ошибка загрузки аренд:", error)
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
        <h1 className="text-3xl font-bold text-foreground">Мои аренды</h1>
        <p className="text-muted-foreground mt-1">Управление активными и завершенными арендами</p>
      </div>

      {rentals.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Нет аренд</h3>
          <p className="text-muted-foreground">У вас пока нет активных или завершенных аренд</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {rentals.map((rental) => (
            <Card key={rental.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{rental.serviceTitle}</h3>
                      <Badge className={statusColors[rental.status]}>{statusLabels[rental.status]}</Badge>
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <User className="w-4 h-4 mr-2" />
                      {user?.role === "SUPPLIER"
                        ? `Арендатор: ${rental.tenantName}`
                        : `Арендодатель: ${rental.supplierName}`}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(rental.startDate).toLocaleDateString("ru-RU")} -{" "}
                      {new Date(rental.endDate).toLocaleDateString("ru-RU")}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Package className="w-4 h-4 mr-2" />
                      Мощность: {rental.capacityRented} единиц
                    </div>
                  </div>

                  <div className="text-lg font-bold text-foreground">
                    Итого: {rental.totalPrice.toLocaleString("ru-RU")} ₽
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:w-48">
                  {rental.status === "COMPLETED" && (
                    <Button
                      onClick={() => router.push(`/dashboard/rentals/${rental.id}/review`)}
                      size="sm"
                      variant="outline"
                      className="bg-transparent"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Оставить отзыв
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/rentals/${rental.id}`)}
                    size="sm"
                    className="bg-transparent"
                  >
                    Подробнее
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
