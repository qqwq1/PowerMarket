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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, DollarSign, MapPin, Eye, TrendingUp } from "lucide-react"

export default function RentalsPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [rentals, setRentals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    loadRentals()
  }, [user, token, router])

  const loadRentals = async () => {
    if (!token) return

    try {
      setLoading(true)
      const data = await api.getRentals(token)
      setRentals(data)
    } catch (error) {
      console.error("[v0] Failed to load rentals:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterRentals = (status: string) => {
    if (status === "all") return rentals
    return rentals.filter((r) => r.status === status)
  }

  if (!user) {
    return null
  }

  const activeRentals = filterRentals("ACTIVE")
  const completedRentals = filterRentals("COMPLETED")
  const cancelledRentals = filterRentals("CANCELLED")

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Мои аренды</h1>
          <p className="text-muted-foreground">
            {user.role === "SUPPLIER" ? "Управляйте вашими арендами" : "Отслеживайте ваши активные аренды"}
          </p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">
              Активные
              {activeRentals.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeRentals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Завершенные</TabsTrigger>
            <TabsTrigger value="cancelled">Отмененные</TabsTrigger>
            <TabsTrigger value="all">Все</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <RentalsList rentals={activeRentals} loading={loading} user={user} />
          </TabsContent>

          <TabsContent value="completed">
            <RentalsList rentals={completedRentals} loading={loading} user={user} />
          </TabsContent>

          <TabsContent value="cancelled">
            <RentalsList rentals={cancelledRentals} loading={loading} user={user} />
          </TabsContent>

          <TabsContent value="all">
            <RentalsList rentals={rentals} loading={loading} user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function RentalsList({ rentals, loading, user }: { rentals: any[]; loading: boolean; user: any }) {
  if (loading) {
    return (
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
    )
  }

  if (rentals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <TrendingUp className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Нет аренд</h3>
          <p className="text-muted-foreground text-center mb-6">Здесь будут отображаться ваши аренды</p>
          {user.role === "TENANT" && (
            <Button asChild>
              <Link href="/search">Найти услуги</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {rentals.map((rental) => (
        <Card key={rental.id} className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between gap-2 mb-2">
              <CardTitle className="text-lg">Аренда #{rental.id}</CardTitle>
              <Badge
                variant={
                  rental.status === "ACTIVE" ? "default" : rental.status === "COMPLETED" ? "secondary" : "destructive"
                }
              >
                {rental.status === "ACTIVE" && "Активна"}
                {rental.status === "COMPLETED" && "Завершена"}
                {rental.status === "CANCELLED" && "Отменена"}
              </Badge>
            </div>
            <CardDescription className="line-clamp-1">
              {user.role === "SUPPLIER"
                ? `Арендатор: ${rental.tenantName || "Не указан"}`
                : `Услуга: ${rental.serviceTitle || "Не указана"}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs mb-1">Период аренды</p>
                  <p className="font-medium">
                    {new Date(rental.startDate).toLocaleDateString("ru-RU")} -{" "}
                    {new Date(rental.endDate).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs mb-1">Общая стоимость</p>
                  <p className="font-semibold">{rental.totalPrice?.toLocaleString()} ₽</p>
                </div>
              </div>

              {rental.serviceLocation && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs mb-1">Локация</p>
                    <p className="font-medium">{rental.serviceLocation}</p>
                  </div>
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" asChild className="mt-auto bg-transparent">
              <Link href={`/rentals/${rental.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Подробнее
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
