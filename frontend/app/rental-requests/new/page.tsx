"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/lib/auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Calendar } from "lucide-react"

export default function NewRentalRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, token } = useAuth()
  const [service, setService] = useState<any>(null)
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    message: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [serviceLoading, setServiceLoading] = useState(true)

  const serviceId = searchParams.get("serviceId")

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    if (user.role !== "TENANT") {
      router.push("/dashboard")
      return
    }

    if (!serviceId) {
      router.push("/search")
      return
    }

    loadService()
  }, [user, token, router, serviceId])

  const loadService = async () => {
    if (!token || !serviceId) return

    try {
      setServiceLoading(true)
      const data = await api.getService(token, Number(serviceId))
      setService(data)
    } catch (error) {
      console.error("[v0] Failed to load service:", error)
      router.push("/search")
    } finally {
      setServiceLoading(false)
    }
  }

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateTotal = () => {
    if (!service) return 0
    return calculateDays() * service.pricePerDay
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("Дата окончания должна быть позже даты начала")
      return
    }

    setLoading(true)

    try {
      await api.createRentalRequest(token!, {
        serviceId: Number(serviceId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        message: formData.message,
      })
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать запрос")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/search">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к поиску
            </Link>
          </Button>

          {serviceLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : service ? (
            <div className="space-y-6">
              {/* Service Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Информация об услуге</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Название</p>
                    <p className="font-semibold">{service.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Описание</p>
                    <p className="text-sm">{service.description}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Цена за день</p>
                      <p className="font-semibold">{service.pricePerDay?.toLocaleString()} ₽</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Локация</p>
                      <p className="font-medium">{service.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Request Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Запрос на аренду</CardTitle>
                  <CardDescription>Заполните детали вашего запроса</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">
                          <Calendar className="inline h-4 w-4 mr-1" />
                          Дата начала *
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          required
                          disabled={loading}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate">
                          <Calendar className="inline h-4 w-4 mr-1" />
                          Дата окончания *
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          required
                          disabled={loading}
                          min={formData.startDate || new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Сообщение поставщику</Label>
                      <Textarea
                        id="message"
                        placeholder="Опишите ваши требования и детали..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        disabled={loading}
                        rows={4}
                      />
                    </div>

                    {formData.startDate && formData.endDate && (
                      <>
                        <Separator />
                        <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                          <h3 className="font-semibold">Расчет стоимости</h3>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Количество дней:</span>
                            <span className="font-medium">{calculateDays()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Цена за день:</span>
                            <span className="font-medium">{service.pricePerDay?.toLocaleString()} ₽</span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Общая стоимость:</span>
                            <span className="text-xl font-bold">{calculateTotal().toLocaleString()} ₽</span>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex gap-4">
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Отправить запрос
                      </Button>
                      <Button type="button" variant="outline" asChild disabled={loading}>
                        <Link href="/search">Отмена</Link>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
