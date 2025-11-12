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
import { Bell, Check } from "lucide-react"

export default function NotificationsPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    loadNotifications()
  }, [user, token, router])

  const loadNotifications = async () => {
    if (!token) return

    try {
      setLoading(true)
      const data = await api.getNotifications(token)
      setNotifications(data)
    } catch (error) {
      console.error("[v0] Failed to load notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    if (!token) return

    try {
      await api.markNotificationAsRead(token, id)
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (error) {
      console.error("[v0] Failed to mark notification as read:", error)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} notificationCount={notifications.filter((n) => !n.read).length} />

      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Уведомления</h1>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Все уведомления
              </CardTitle>
              <CardDescription>Ваши последние уведомления и обновления</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b border-border">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0 ${
                        !notification.read ? "bg-accent/20 -mx-6 px-6 py-4" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <p className="font-medium">{notification.message}</p>
                          {!notification.read && <Badge variant="default">Новое</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString("ru-RU")}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Нет уведомлений</p>
                  <p className="text-sm">Здесь будут отображаться ваши уведомления</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
