"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/lib/auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, DollarSign, MapPin, User, FileText, MessageSquare, Factory, Building } from "lucide-react"

export default function RentalDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, token } = useAuth()
  const [rental, setRental] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    loadRental()
  }, [user, token, router, params.id])

  const loadRental = async () => {
    if (!token || !params.id) return

    try {
      setLoading(true)
      const data = await api.getRental(token, Number(params.id))
      setRental(data)
    } catch (error) {
      console.error("[v0] Failed to load rental:", error)
      router.push("/rentals")
    } finally {
      setLoading(false)
    }
  }

  const calculateDuration = () => {
    if (!rental) return 0
    const start = new Date(rental.startDate)
    const end = new Date(rental.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/rentals">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к арендам
            </Link>
          </Button>

          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ) : rental ? (
            <div className="space-y-6">
              {/* Header Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-2">Аренда #{rental.id}</CardTitle>
                      <CardDescription>
                        Создана {new Date(rental.createdAt).toLocaleDateString("ru-RU")}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        rental.status === "ACTIVE"
                          ? "default"
                          : rental.status === "COMPLETED"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-base px-4 py-1"
                    >
                      {rental.status === "ACTIVE" && "Активна"}
                      {rental.status === "COMPLETED" && "Завершена"}
                      {rental.status === "CANCELLED" && "Отменена"}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Service Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5" />
                    Информация об услуге
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Название услуги</p>
                    <p className="font-semibold text-lg">{rental.serviceTitle || "Не указано"}</p>
                  </div>

                  {rental.serviceDescription && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Описание</p>
                      <p className="text-sm leading-relaxed">{rental.serviceDescription}</p>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    {rental.serviceLocation && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Локация</p>
                          <p className="font-medium">{rental.serviceLocation}</p>
                        </div>
                      </div>
                    )}

                    {rental.pricePerDay && (
                      <div className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Цена за день</p>
                          <p className="font-medium">{rental.pricePerDay?.toLocaleString()} ₽</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Rental Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Детали аренды
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Дата начала</p>
                      <p className="font-semibold">{new Date(rental.startDate).toLocaleDateString("ru-RU")}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Дата окончания</p>
                      <p className="font-semibold">{new Date(rental.endDate).toLocaleDateString("ru-RU")}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Продолжительность</span>
                      <span className="font-medium">{calculateDuration()} дней</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Цена за день</span>
                      <span className="font-medium">{rental.pricePerDay?.toLocaleString()} ₽</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Общая стоимость</span>
                      <span className="text-xl font-bold">{rental.totalPrice?.toLocaleString()} ₽</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parties Info */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Supplier Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building className="h-5 w-5" />
                      Поставщик
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Имя</p>
                      <p className="font-medium">{rental.supplierName || "Не указано"}</p>
                    </div>
                    {rental.supplierCompany && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Компания</p>
                        <p className="font-medium">{rental.supplierCompany}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tenant Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5" />
                      Арендатор
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Имя</p>
                      <p className="font-medium">{rental.tenantName || "Не указано"}</p>
                    </div>
                    {rental.tenantCompany && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Компания</p>
                        <p className="font-medium">{rental.tenantCompany}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Additional Info */}
              {rental.requestMessage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Сообщение запроса
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-md">{rental.requestMessage}</p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Действия</CardTitle>
                  <CardDescription>Управление арендой</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Button variant="outline" asChild className="flex-1 bg-transparent">
                    <Link href={`/chats?rentalId=${rental.id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Открыть чат
                    </Link>
                  </Button>
                  {rental.serviceId && (
                    <Button variant="outline" asChild className="flex-1 bg-transparent">
                      <Link href={`/services/${rental.serviceId}`}>
                        <Factory className="mr-2 h-4 w-4" />
                        Просмотр услуги
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
