"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/lib/auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, CheckCircle, XCircle, Calendar, DollarSign } from "lucide-react"

export default function RentalRequestsPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    loadRequests()
  }, [user, token, router])

  const loadRequests = async () => {
    if (!token) return

    try {
      setLoading(true)
      const data = await api.getRentalRequests(token)
      setRequests(data)
    } catch (error) {
      console.error("[v0] Failed to load rental requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (requestId: number, approved: boolean) => {
    if (!token) return

    setActionLoading(requestId)
    setError("")

    try {
      await api.respondToRentalRequest(token, requestId, { approved })
      await loadRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обработать запрос")
    } finally {
      setActionLoading(null)
    }
  }

  const filterRequests = (status: string) => {
    if (status === "all") return requests
    return requests.filter((r) => r.status === status)
  }

  if (!user) {
    return null
  }

  const pendingRequests = filterRequests("PENDING")
  const approvedRequests = filterRequests("APPROVED")
  const rejectedRequests = filterRequests("REJECTED")

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Запросы на аренду</h1>
          <p className="text-muted-foreground">
            {user.role === "SUPPLIER" ? "Управляйте входящими запросами" : "Отслеживайте статус ваших запросов"}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Ожидающие
              {pendingRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Одобренные</TabsTrigger>
            <TabsTrigger value="rejected">Отклоненные</TabsTrigger>
            <TabsTrigger value="all">Все</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <RequestsList
              requests={pendingRequests}
              loading={loading}
              user={user}
              actionLoading={actionLoading}
              onRespond={handleRespond}
            />
          </TabsContent>

          <TabsContent value="approved">
            <RequestsList requests={approvedRequests} loading={loading} user={user} />
          </TabsContent>

          <TabsContent value="rejected">
            <RequestsList requests={rejectedRequests} loading={loading} user={user} />
          </TabsContent>

          <TabsContent value="all">
            <RequestsList requests={requests} loading={loading} user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function RequestsList({
  requests,
  loading,
  user,
  actionLoading,
  onRespond,
}: {
  requests: any[]
  loading: boolean
  user: any
  actionLoading?: number | null
  onRespond?: (id: number, approved: boolean) => void
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Clock className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Нет запросов</h3>
          <p className="text-muted-foreground text-center">Здесь будут отображаться запросы на аренду</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">Запрос #{request.id}</CardTitle>
                <CardDescription>
                  {user.role === "SUPPLIER"
                    ? `От: ${request.tenantName || "Арендатор"}`
                    : `Услуга: ${request.serviceTitle || "Услуга"}`}
                </CardDescription>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Период</p>
                  <p className="text-sm font-medium">
                    {new Date(request.startDate).toLocaleDateString("ru-RU")} -{" "}
                    {new Date(request.endDate).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>

              {request.totalPrice && (
                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Стоимость</p>
                    <p className="text-sm font-medium">{request.totalPrice?.toLocaleString()} ₽</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Создан</p>
                  <p className="text-sm font-medium">{new Date(request.createdAt).toLocaleDateString("ru-RU")}</p>
                </div>
              </div>
            </div>

            {request.message && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Сообщение</p>
                <p className="text-sm bg-muted/50 p-3 rounded-md">{request.message}</p>
              </div>
            )}

            {user.role === "SUPPLIER" && request.status === "PENDING" && onRespond && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => onRespond(request.id, true)}
                  disabled={actionLoading === request.id}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Одобрить
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onRespond(request.id, false)}
                  disabled={actionLoading === request.id}
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Отклонить
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
