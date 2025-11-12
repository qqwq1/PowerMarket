"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/lib/auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const categories = [
  { value: "MANUFACTURING", label: "Производство" },
  { value: "EQUIPMENT", label: "Оборудование" },
  { value: "WAREHOUSE", label: "Складские помещения" },
  { value: "TRANSPORT", label: "Транспорт" },
  { value: "LABORATORY", label: "Лабораторные услуги" },
  { value: "PROCESSING", label: "Обработка" },
  { value: "ASSEMBLY", label: "Сборка" },
  { value: "TESTING", label: "Тестирование" },
  { value: "OTHER", label: "Другое" },
]

export default function EditServicePage() {
  const router = useRouter()
  const params = useParams()
  const { user, token } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    pricePerDay: "",
    location: "",
    capacity: "",
    technicalSpecs: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    if (user.role !== "SUPPLIER") {
      router.push("/dashboard")
      return
    }

    loadService()
  }, [user, token, router, params.id])

  const loadService = async () => {
    if (!token || !params.id) return

    try {
      setInitialLoading(true)
      const data = await api.getService(token, Number(params.id))

      if (data.supplierId !== user?.id) {
        router.push("/services")
        return
      }

      setFormData({
        title: data.title,
        description: data.description,
        category: data.category,
        pricePerDay: data.pricePerDay?.toString() || "",
        location: data.location,
        capacity: data.capacity?.toString() || "",
        technicalSpecs: data.technicalSpecs || "",
      })
    } catch (error) {
      console.error("[v0] Failed to load service:", error)
      router.push("/services")
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await api.updateService(token!, Number(params.id), {
        ...formData,
        pricePerDay: Number.parseFloat(formData.pricePerDay),
        capacity: formData.capacity ? Number.parseInt(formData.capacity) : null,
      })
      router.push(`/services/${params.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить услугу")
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
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/services/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к услуге
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Редактировать услугу</CardTitle>
              <CardDescription>Обновите информацию о вашей производственной мощности</CardDescription>
            </CardHeader>
            <CardContent>
              {initialLoading ? (
                <div className="space-y-6">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">Название услуги *</Label>
                    <Input
                      id="title"
                      placeholder="Например: Токарный станок ЧПУ"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Описание *</Label>
                    <Textarea
                      id="description"
                      placeholder="Подробное описание услуги..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      disabled={loading}
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">Категория *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        disabled={loading}
                        required
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pricePerDay">Цена за день (₽) *</Label>
                      <Input
                        id="pricePerDay"
                        type="number"
                        placeholder="10000"
                        value={formData.pricePerDay}
                        onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                        required
                        disabled={loading}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">Локация *</Label>
                      <Input
                        id="location"
                        placeholder="Москва, Россия"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacity">Мощность (единиц)</Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="100"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        disabled={loading}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="technicalSpecs">Технические характеристики</Label>
                    <Textarea
                      id="technicalSpecs"
                      placeholder="Детальные технические характеристики..."
                      value={formData.technicalSpecs}
                      onChange={(e) => setFormData({ ...formData, technicalSpecs: e.target.value })}
                      disabled={loading}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Сохранить изменения
                    </Button>
                    <Button type="button" variant="outline" asChild disabled={loading}>
                      <Link href={`/services/${params.id}`}>Отмена</Link>
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
