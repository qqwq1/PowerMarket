'use client'

import type React from 'react'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { Chat, ChatMessage, RentalRequest } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import urls from '@/components/layout/urls'
import { MainLayout } from '@/components/layout/dashboard-layout'

function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const requestId = params.requestId as string
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [rentalRequest, setRentalRequest] = useState<RentalRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChat()
    loadRentalRequest()
    const interval = setInterval(loadMessages, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [requestId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChat = async () => {
    try {
      const data = await api.get<Chat>(`/chats/rental-request/${requestId}`)
      setChat(data)
      loadMessages()
    } catch (error) {
      console.error('Ошибка загрузки чата:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const data = await api.get<ChatMessage[]>(`/chats/rental-request/${requestId}/messages`)
      setMessages(data)
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error)
    }
  }

  const loadRentalRequest = async () => {
    try {
      const data = await api.get<RentalRequest>(`/rental-requests/${requestId}`)
      setRentalRequest(data)
    } catch (error) {
      console.error('Ошибка загрузки заявки:', error)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      await api.post(`/chats/rental-request/${requestId}/messages`, {
        content: newMessage.trim(),
      })
      setNewMessage('')
      loadMessages()
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
      alert('Не удалось отправить сообщение')
    } finally {
      setSending(false)
    }
  }

  const getOtherParticipant = () => {
    if (!chat) return null

    if (chat.supplierId === user?.id || chat.supplierId.includes(user?.id) || user?.id.includes(chat.supplierId)) {
      return chat.tenantName
    }
    return chat.supplierName
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  const otherParticipant = getOtherParticipant()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </div>

      {rentalRequest && (
        <Card className="p-4 bg-muted">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{rentalRequest.serviceTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(rentalRequest.startDate).toLocaleDateString('ru-RU')} -{' '}
                {new Date(rentalRequest.endDate).toLocaleDateString('ru-RU')}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push(urls.common.detailRentalPage(requestId))}>
              Детали заявки
            </Button>
          </div>
        </Card>
      )}

      <Card className="flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">{otherParticipant}</h2>
            <p className="text-xs text-muted-foreground">{otherParticipant}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Нет сообщений. Начните общение!
            </div>
          ) : (
            messages.map((message) => {
              const userIdStr = String(user?.id)
              const messageSenderIdStr = String(message.senderId)
              const isOwn =
                messageSenderIdStr === userIdStr ||
                messageSenderIdStr.includes(userIdStr) ||
                userIdStr.includes(messageSenderIdStr)

              return (
                <div key={message.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[70%] space-y-1', isOwn ? 'items-end' : 'items-start')}>
                    <div
                      className={cn(
                        'rounded-lg px-4 py-2',
                        isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="text-xs text-muted-foreground px-2">
                      {new Date(message.sentAt).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !newMessage.trim()} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default () => (
  <MainLayout>
    <ChatPage />
  </MainLayout>
)
