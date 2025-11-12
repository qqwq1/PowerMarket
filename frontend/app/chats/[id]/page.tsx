"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/lib/auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Send, User } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ChatDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, token } = useAuth()
  const [chat, setChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    loadChat()
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadChat, 5000)
    return () => clearInterval(interval)
  }, [user, token, router, params.id])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const loadChat = async () => {
    if (!token || !params.id) return

    try {
      if (loading) setLoading(true)
      const data = await api.getChat(token, Number(params.id))
      setChat(data)
      setMessages(data.messages || [])
    } catch (error) {
      console.error("[v0] Failed to load chat:", error)
      if (loading) router.push("/chats")
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newMessage.trim() || sending) return

    setSending(true)

    try {
      await api.sendMessage(token, Number(params.id), newMessage.trim())
      setNewMessage("")
      await loadChat()
    } catch (error) {
      console.error("[v0] Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  if (!user) {
    return null
  }

  const otherParticipants = chat?.participantNames?.filter((name: string) => name !== user.fullName) || []

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
          <Button variant="ghost" asChild className="mb-4 self-start">
            <Link href="/chats">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к чатам
            </Link>
          </Button>

          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b border-border">
              {loading ? (
                <Skeleton className="h-6 w-1/3" />
              ) : (
                <CardTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg">{otherParticipants.join(", ") || "Чат"}</p>
                    {chat?.rentalId && (
                      <p className="text-sm text-muted-foreground font-normal">Аренда #{chat.rentalId}</p>
                    )}
                  </div>
                </CardTitle>
              )}
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                        <Skeleton className="h-16 w-2/3 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.senderName === user.fullName || message.senderId === user.id
                      return (
                        <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[70%] rounded-lg px-4 py-2",
                              isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
                            )}
                          >
                            {!isOwn && <p className="text-xs font-semibold mb-1 opacity-70">{message.senderName}</p>}
                            <p className="text-sm leading-relaxed break-words">{message.content}</p>
                            <p
                              className={cn(
                                "text-xs mt-1",
                                isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
                              )}
                            >
                              {new Date(message.sentAt).toLocaleTimeString("ru-RU", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
                    <p>Нет сообщений</p>
                    <p className="text-sm">Начните разговор</p>
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Введите сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
