'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Chat, Page } from '@/types'
import { Card } from '@/components/ui/card'
import { MessageSquare, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import urls from '@/components/layout/urls'
import { MainLayout } from '@/components/layout/dashboard-layout'

function ChatListPage() {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      const data = await api.get<Page<Chat>>('/v1/chats', { size: 100 })
      console.log(data)
      setChats(data.content)
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error)
    } finally {
      setLoading(false)
    }
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
          {chats.map((chat) => (
            <Card
              key={chat.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(urls.common.chatPage(chat.id))}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{chat.counterpartName}</h3>
                  {chat.lastMessagePreview && (
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessagePreview.content}</p>
                  )}
                </div>
                {chat.lastMessagePreview && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(chat.lastMessagePreview.sentAt).toLocaleDateString('ru-RU')}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default () => (
  <MainLayout>
    <ChatListPage />
  </MainLayout>
)
