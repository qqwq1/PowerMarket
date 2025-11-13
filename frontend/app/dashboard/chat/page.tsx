"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import type { Chat } from "@/types"
import { Card } from "@/components/ui/card"
import { MessageSquare, User } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ChatListPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      const data = await api.get<Chat[]>("/chats/my")
      setChats(data)
    } catch (error) {
      console.error("Ошибка загрузки чатов:", error)
    } finally {
      setLoading(false)
    }
  }

  const getOtherParticipant = (chat: Chat) => {
    if (chat.supplierId === user?.id) {
      return { name: chat.tenantName, id: chat.tenantId }
    }
    return { name: chat.supplierName, id: chat.supplierId }
  }

  const getLastMessage = (chat: Chat) => {
    if (chat.recentMessages && chat.recentMessages.length > 0) {
      return chat.recentMessages[0]
    }
    return null
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">Загрузка...</div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Чаты</h1>
          <p className="text-muted-foreground mt-1">Общение с партнерами по аренде</p>
        </div>

        {chats.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Нет чатов</h3>
              <p className="text-muted-foreground">Чаты создаются автоматически при одобрении заявки на аренду</p>
            </Card>
        ) : (
            <div className="grid gap-4">
              {chats.map((chat) => {
                const otherParticipant = getOtherParticipant(chat)
                const lastMessage = getLastMessage(chat)
                return (
                    <Card
                        key={chat.id}
                        className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => router.push(`/dashboard/chat/${chat.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{otherParticipant.name}</h3>
                          {lastMessage && <p className="text-sm text-muted-foreground truncate">{lastMessage.content}</p>}
                        </div>
                        {lastMessage && (
                            <div className="text-xs text-muted-foreground">
                              {new Date(lastMessage.createdAt).toLocaleDateString("ru-RU")}
                            </div>
                        )}
                      </div>
                    </Card>
                )
              })}
            </div>
        )}
      </div>
  )
}
