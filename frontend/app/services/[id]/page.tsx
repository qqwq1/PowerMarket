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
import { ArrowLeft, Edit, MapPin, DollarSign, Package, FileText } from "lucide-react"

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

export default function ServiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, token } = useAuth()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    loadService()
  }, [user, token, router, params.id])

  const loadService = async () => {
    if (!token || !params.id) return

    try {
      setLoading(true)
      const data = await api.getService(token, Number(params.id))
      setService(data)
    } catch (error) {
      console.error("[v0] Failed to load service:", error)
      router.push("/services")
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" asChild>
              <Link href="/services">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад к услугам
              </Link>
            </Button>
            {service && user.id === service.supplierId && (
              <Button asChild>
                <Link href={`/services/${params.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Редактировать
                </Link>
              </Button>
            )}
          </div>

          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ) : service ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-2">{service.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{categoryLabels[service.category] || service.category}</Badge>
                        <Badge variant={service.active ? "default" : "secondary"}>
                          {service.active ? "Активна" : "Неактивна"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Описание</h3>
                    <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>

                  <Separator />

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Цена за день</p>
                        <p className="text-xl font-semibold">{service.pricePerDay?.toLocaleString()} ₽</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Локация</p>
                        <p className="font-medium">{service.location}</p>
                      </div>
                    </div>

                    {service.capacity && (
                      <div className="flex items-start gap-3">
                        <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Мощность</p>
                          <p className="font-medium">{service.capacity} единиц</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Поставщик</p>
                        <p className="font-medium">{service.supplierName || "Не указан"}</p>
                      </div>
                    </div>
                  </div>

                  {service.technicalSpecs && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Технические характеристики</h3>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {service.technicalSpecs}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {user.role === "TENANT" && service.active && (
                <Card>
                  <CardHeader>
                    <CardTitle>Заинтересованы в этой услуге?</CardTitle>
                    <CardDescription>Отправьте запрос на аренду поставщику</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href={`/rental-requests/new?serviceId=${service.id}`}>Отправить запрос на аренду</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
