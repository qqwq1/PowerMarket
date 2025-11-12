"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/lib/auth"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { MessageSquare, Search, User } from "lucide-react"

export default function ChatsPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [chats, setChats] = useState<any[]>([])
  const [filteredChats, setFilteredChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    loadChats()
  }, [user, token, router])

  useEffect(() => {
    if (searchQuery) {
      setFilteredChats(
        chats.filter((chat) =>
          chat.participantNames?.some((name: string) => name.toLowerCase().includes(searchQuery.toLowerCase())),
        ),
      )
    } else {
      setFilteredChats(chats)
    }
  }, [searchQuery, chats])

  const loadChats = async () => {
    if (!token) return

    try {
      setLoading(true)
      const data = await api.getChats(token)
      setChats(data)
      setFilteredChats(data)
    } catch (error) {
      console.error("[v0] Failed to load chats:", error)
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
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Чаты</h1>
            <p className="text-muted-foreground">Общайтесь с партнерами по бизнесу</p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск чатов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Chats List */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredChats.length > 0 ? (
            <div className="space-y-3">
              {filteredChats.map((chat) => (
                <Link key={chat.id} href={`/chats/${chat.id}`}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-semibold truncate">
                              {chat.participantNames?.filter((name: string) => name !== user.fullName).join(", ") ||
                                "Чат"}
                            </p>
                            {chat.lastMessageTime && (
                              <span className="text-xs text-muted-foreground shrink-0">
                                {new Date(chat.lastMessageTime).toLocaleDateString("ru-RU")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-muted-foreground truncate">
                              {chat.lastMessage || "Нет сообщений"}
                            </p>
                            {chat.unreadCount > 0 && (
                              <Badge variant="default" className="shrink-0">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">{searchQuery ? "Чаты не найдены" : "Нет активных чатов"}</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery
                    ? "Попробуйте изменить параметры поиска"
                    : "Чаты появятся после взаимодействия с другими пользователями"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
