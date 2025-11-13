"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { RentalRequest } from "@/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, MessageSquare } from "lucide-react"

const statusLabels: Record<string, string> = {
  PENDING: "Ожидает ответа",
  IN_CONTRACT: "В договоре",
  CONFIRMED: "Подтверждено",
  IN_RENT: "В аренде",
  COMPLETED: "Завершено",
  REJECTED: "Отклонено",
  CANCELLED: "Отменено",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_CONTRACT: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  IN_RENT: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
}

export default function RentalDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const rentalId = params.id as string
  const [rental, setRental] = useState<RentalRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    loadRental()
  }, [rentalId])

  const loadRental = async () => {
    try {
      const data = await api.get<RentalRequest>(`/rental-requests/${rentalId}`)
      setRental(data)
    } catch (error) {
      console.error("Ошибка загрузки заявки:", error)
      alert("Не удалось загрузить заявку")
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      const endpoint =
        user?.role === "SUPPLIER" ? `/rentals/${rentalId}/confirm-landlord` : `/rentals/${rentalId}/confirm-tenant`
      await api.post(endpoint, {})
      loadRental()
    } catch (error) {
      console.error("Ошибка подтверждения:", error)
      alert("Не удалось подтвердить аренду")
    } finally {
      setConfirming(false)
    }
  }

  const canConfirm = () => {
    if (!rental || rental.status !== "IN_CONTRACT") return false
    if (user?.role === "SUPPLIER") return !rental.landlordConfirmed
    if (user?.role === "TENANT") return !rental.tenantConfirmed
    return false
  }

  const calculateDays = () => {
    if (!rental) return 0
    const start = new Date(rental.startDate)
    const end = new Date(rental.endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    if (!rental || !rental.service) return 0
    return calculateDays() * rental.capacityNeeded * rental.service.pricePerDay
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
          <h1 className="text-3xl font-bold">{rental.service?.title}</h1>
          <p className="text-muted-foreground mt-1">Детали заявки на аренду</p>
        </div>
        <Badge className={statusColors[rental.status]}>{statusLabels[rental.status]}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Информация об аренде</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Услуга</span>
                <span className="font-semibold">{rental.service?.title}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">
                  {user?.role === "SUPPLIER" ? "Арендатор" : "Арендодатель"}
                </span>
                <span className="font-semibold">
                  {user?.role === "SUPPLIER"
                    ? rental.tenantName
                    : rental.service?.supplierName}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Период аренды</span>
                <span className="font-semibold">
                  {new Date(rental.startDate).toLocaleDateString("ru-RU")} -{" "}
                  {new Date(rental.endDate).toLocaleDateString("ru-RU")}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Количество дней</span>
                <span className="font-semibold">{calculateDays()}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Требуемая мощность</span>
                <span className="font-semibold">{rental.capacityNeeded} единиц</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Цена за день</span>
                <span className="font-semibold">{rental.service?.pricePerDay.toLocaleString("ru-RU")} ₽</span>
              </div>

              <div className="flex items-center justify-between py-3 text-lg">
                <span className="font-bold">Итого</span>
                <span className="font-bold text-2xl">{calculateTotal().toLocaleString("ru-RU")} ₽</span>
              </div>
            </div>
          </Card>

          {(rental.status === "IN_CONTRACT" || rental.status === "CONFIRMED") && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Статус подтверждения</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {rental.landlordConfirmed ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-gray-400" />
                    )}
                    <div>
                      <div className="font-semibold">Арендодатель</div>
                      <div className="text-sm text-muted-foreground">
                        {rental.service?.supplierName}
                      </div>
                    </div>
                  </div>
                  <Badge className={rental.landlordConfirmed ? "bg-green-100 text-green-800" : ""}>
                    {rental.landlordConfirmed ? "Подтверждено" : "Ожидает"}
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
                      <div className="text-sm text-muted-foreground">
                        {rental.tenantName}
                      </div>
                    </div>
                  </div>
                  <Badge className={rental.tenantConfirmed ? "bg-green-100 text-green-800" : ""}>
                    {rental.tenantConfirmed ? "Подтверждено" : "Ожидает"}
                  </Badge>
                </div>

                {rental.landlordConfirmed && rental.tenantConfirmed && rental.status === "CONFIRMED" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="font-semibold text-green-800">Обе стороны подтвердили аренду</div>
                    <div className="text-sm text-green-700 mt-1">Аренда будет активирована в дату начала</div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Действия</h3>

            {canConfirm() && (
              <Button className="w-full" onClick={handleConfirm} disabled={confirming}>
                {confirming ? "Подтверждение..." : "Подтвердить аренду"}
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push(`/dashboard/chat/${rental.id}`)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Открыть чат
            </Button>

            {rental.status === "PENDING" && user?.role === "TENANT" && (
              <Button
                variant="outline"
                className="w-full text-red-600 hover:bg-red-50 bg-transparent"
                onClick={async () => {
                  if (confirm("Вы уверены, что хотите отменить заявку?")) {
                    try {
                      await api.post(`/rental-requests/${rental.id}/cancel`, {})
                      router.push("/dashboard/requests")
                    } catch (error) {
                      console.error("Ошибка отмены:", error)
                      alert("Не удалось отменить заявку")
                    }
                  }
                }}
              >
                Отменить заявку
              </Button>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-3">Информация</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Заявка создана: {new Date(rental.createdAt).toLocaleDateString("ru-RU")}</p>
              {rental.status === "IN_CONTRACT" && (
                <p className="text-blue-600">Обе стороны должны подтвердить условия аренды для продолжения.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
