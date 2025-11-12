"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/lib/auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Factory, Search, MessageSquare, TrendingUp, Clock, CheckCircle } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    loadDashboardData()
  }, [user, token, router])

  const loadDashboardData = async () => {
    if (!token) return

    try {
      setLoading(true)
      const [services, rentals, requests] = await Promise.all([
        api.getServices(token).catch(() => []),
        api.getRentals(token).catch(() => []),
        api.getRentalRequests(token).catch(() => []),
      ])

      // Calculate stats based on user role
      if (user?.role === "SUPPLIER") {
        setStats({
          totalServices: services.length,
          activeRentals: rentals.filter((r: any) => r.status === "ACTIVE").length,
          pendingRequests: requests.filter((r: any) => r.status === "PENDING").length,
          totalRevenue: rentals.reduce((sum: number, r: any) => sum + (r.totalPrice || 0), 0),
        })
      } else {
        setStats({
          activeRentals: rentals.filter((r: any) => r.status === "ACTIVE").length,
          pendingRequests: requests.filter((r: any) => r.status === "PENDING").length,
          completedRentals: rentals.filter((r: any) => r.status === "COMPLETED").length,
          totalSpent: rentals.reduce((sum: number, r: any) => sum + (r.totalPrice || 0), 0),
        })
      }

      // Set recent activity
      setRecentActivity(requests.slice(0, 5))
    } catch (error) {
      console.error("[v0] Failed to load dashboard data:", error)
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Добро пожаловать, {user.fullName}</h1>
          <p className="text-muted-foreground">
            {user.role === "SUPPLIER"
              ? "Управляйте своими услугами и арендами"
              : "Найдите необходимые производственные мощности"}
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {user.role === "SUPPLIER" ? (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Всего услуг</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">{stats?.totalServices || 0}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Активные аренды</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">{stats?.activeRentals || 0}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Ожидающие запросы</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">{stats?.pendingRequests || 0}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Общий доход</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-2xl font-bold">{stats?.totalRevenue?.toLocaleString() || 0} ₽</span>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Активные аренды</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">{stats?.activeRentals || 0}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Ожидающие запросы</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">{stats?.pendingRequests || 0}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Завершенные аренды</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">{stats?.completedRentals || 0}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Всего потрачено</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-2xl font-bold">{stats?.totalSpent?.toLocaleString() || 0} ₽</span>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {user.role === "SUPPLIER" ? (
            <>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer" >
                <Link href="/services/new">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Factory className="h-5 w-5" />
                      Добавить услугу
                    </CardTitle>
                    <CardDescription>Разместите новую производственную мощность</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer" >
                <Link href="/services">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Мои услуги
                    </CardTitle>
                    <CardDescription>Управляйте своими предложениями</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer" >
                <Link href="/chats">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Чаты
                    </CardTitle>
                    <CardDescription>Общайтесь с арендаторами</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            </>
          ) : (
            <>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer" >
                <Link href="/search">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Поиск услуг
                    </CardTitle>
                    <CardDescription>Найдите необходимые мощности</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer" >
                <Link href="/rentals">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Мои аренды
                    </CardTitle>
                    <CardDescription>Просмотрите активные аренды</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer" >
                <Link href="/chats">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Чаты
                    </CardTitle>
                    <CardDescription>Общайтесь с поставщиками</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Последние запросы на аренду</CardTitle>
            <CardDescription>Недавняя активность по запросам</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((request: any) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">Запрос #{request.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        request.status === "APPROVED"
                          ? "default"
                          : request.status === "REJECTED"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {request.status === "PENDING" && "Ожидает"}
                      {request.status === "APPROVED" && "Одобрен"}
                      {request.status === "REJECTED" && "Отклонен"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Нет недавней активности</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
