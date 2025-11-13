"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api"
import type { Service } from "@/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Calendar } from "lucide-react"

interface CapacityAvailability {
  date: string
  totalCapacity: number
  availableCapacity: number
  occupiedCapacity: number
  rentals: Array<{
    id: number
    renterName: string
    capacityRented: number
    endDate: string
  }>
}

export default function CapacityCheckPage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string
  const [service, setService] = useState<Service | null>(null)
  const [availability, setAvailability] = useState<CapacityAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    loadService()
  }, [serviceId])

  const loadService = async () => {
    try {
      const data = await api.get<Service>(`/services/${serviceId}`)
      setService(data)
    } catch (error) {
      console.error("Ошибка загрузки услуги:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkAvailability = async () => {
    if (!startDate || !endDate) {
      alert("Пожалуйста, выберите даты")
      return
    }

    try {
      const data = await api.get<CapacityAvailability[]>(
        `/capacity/check/${serviceId}?startDate=${startDate}&endDate=${endDate}`,
      )
      setAvailability(data)
    } catch (error) {
      console.error("Ошибка проверки доступности:", error)
      alert("Не удалось проверить доступность")
    }
  }

  if (loading || !service) {
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

      <div>
        <h1 className="text-3xl font-bold">{service.title}</h1>
        <p className="text-muted-foreground mt-1">Проверка доступности мощностей</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Дата начала</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Дата окончания</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split("T")[0]}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={checkAvailability} className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Проверить
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {availability.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Результаты проверки</h2>
          <div className="space-y-4">
            {availability.map((day) => (
              <div key={day.date} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">{new Date(day.date).toLocaleDateString("ru-RU")}</div>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Доступно: </span>
                      <span className="font-semibold text-green-600">{day.availableCapacity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Занято: </span>
                      <span className="font-semibold text-red-600">{day.occupiedCapacity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Всего: </span>
                      <span className="font-semibold">{day.totalCapacity}</span>
                    </div>
                  </div>
                </div>

                {day.rentals.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Текущие аренды:</div>
                    {day.rentals.map((rental) => (
                      <div key={rental.id} className="text-sm bg-muted p-2 rounded flex justify-between">
                        <span>{rental.renterName}</span>
                        <span>
                          {rental.capacityRented} ед. до {new Date(rental.endDate).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
