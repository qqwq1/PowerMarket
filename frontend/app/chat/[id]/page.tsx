'use client'

import { useEffect, useLayoutEffect, useState, useRef, FormEvent, UIEvent, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { ChatDetails, ChatMessage, Page, Rental } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import urls from '@/components/layout/urls'
import { MainLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { statusColors, statusLabels } from '@/lib/constants'

function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const chatId = params.id as string
  const [chat, setChat] = useState<ChatDetails>(null)
  const [rental, setRental] = useState<Rental>(null)
  const [messages, setMessages] = useState<{ page: number; messages: ChatMessage[]; totalElements: number }>({
    page: 0,
    messages: [],
    totalElements: 0,
  })
  const [chatLoading, setChatLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isScrolledEnd = useRef(false)

  useEffect(() => {
    if (loadingMore || messagesLoading || chatLoading) return

    const loadData = async () => {
      await loadChat()
      loadMessages(0)
    }
    loadData()
    const interval = setInterval(loadData, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [chatId])

  useEffect(() => {
    if (!chat) return
    loadRental()
  }, [chat])

  const loadRental = async () => {
    try {
      const data = await api.get<Rental>(`/v1/rentals/${chat.rentalId}`)
      setRental(data)
    } catch (error) {
      console.error('Ошибка загрузки заявки:', error)
      alert('Не удалось загрузить заявку')
      router.back()
    }
  }

  useLayoutEffect(() => {
    if (messages.messages.length === 0 || isScrolledEnd.current) return
    scrollToBottom('auto')
    isScrolledEnd.current = true
    console.log(123)
  }, [messages.messages.length])

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior })
      return
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' })
  }

  const loadChat = useCallback(async () => {
    try {
      setChatLoading(true)
      const data = await api.get<ChatDetails>(`/v1/chats/${chatId}`)
      setChat(data)
    } catch (error) {
      console.error('Ошибка загрузки чата:', error)
    } finally {
      setChatLoading(false)
    }
  }, [chatId])

  const loadMessages = async (page = 0, { scrollToBottom: scrollToBottomAfter = false } = {}) => {
    try {
      setMessagesLoading(true)
      const data = await api.get<Page<ChatMessage>>(`/v1/chats/${chatId}/messages`, { page })
      setMessages((prev) => {
        const initMsgIdsSet = new Set<string>(prev.messages.map((m) => m.id))
        const newMsg = [...data.content].filter((msg) => msg.id && !initMsgIdsSet.has(msg.id))
        return {
          page: data.page.number,
          messages: [...prev.messages, ...newMsg],
          totalElements: data.page.totalElements,
        }
      })
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error)
    } finally {
      if (scrollToBottomAfter) scrollToBottom()
      setMessagesLoading(false)
    }
  }

  const loadMoreMessages = async () => {
    if (loadingMore) return
    if (messages.messages.length >= messages.totalElements) return

    setLoadingMore(true)
    try {
      await loadMessages(messages.page + 1)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    if (target.scrollTop <= 16 && !loadingMore && messages.messages.length < messages.totalElements) {
      loadMoreMessages()
    }
  }

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      await api.post(`/v1/chats/${chatId}/messages`, {
        content: newMessage.trim(),
      })
      setNewMessage('')
      await loadMessages(0, { scrollToBottom: true })
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
      alert('Не удалось отправить сообщение')
    } finally {
      setSending(false)
    }
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </div>

      <Card className="p-4 bg-muted">
        <div className="flex items-center justify-between">
          {rental && (
            <div>
              <h3 className="font-semibold">{chat.rentalTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(rental.startDate).toLocaleDateString('ru-RU')} -{' '}
                {new Date(rental.endDate).toLocaleDateString('ru-RU')}
              </p>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push(urls.common.detailRentalPage(chat.rentalId))}>
            Детали заявки
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col h-[600px] py-0">
        {/* Chat Header */}
        <div className="p-4 border-b flex flex-row items-center justify-between">
          <div className=" flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-semibold">{chat.counterpartName}</h2>
              <p className="text-xs text-muted-foreground">{chat.counterpartName}</p>
            </div>
          </div>
          <div>{rental && <Badge className={statusColors[rental.status]}>{statusLabels[rental.status]}</Badge>}</div>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4" onScroll={handleScroll}>
          {loadingMore && (
            <div className="text-xs text-muted-foreground text-center">Загружаем более старые сообщения...</div>
          )}
          {messages?.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Нет сообщений. Начните общение!
            </div>
          ) : (
            [...messages.messages]
              .sort((a, b) => {
                const ta = a?.sentAt ? new Date(a.sentAt).getTime() : 0
                const tb = b?.sentAt ? new Date(b.sentAt).getTime() : 0
                return ta - tb
              })
              .map((message) => {
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
