"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api"
import type { Service } from "@/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

const categories = ["MANUFACTURING", "LOGISTICS", "STORAGE", "PROCESSING", "ASSEMBLY", "PACKAGING", "OTHER"]

const categoryLabels: Record<string, string> = {
  MANUFACTURING: "Производство",
  LOGISTICS: "Логистика",
  STORAGE: "Складирование",
  PROCESSING: "Обработка",
  ASSEMBLY: "Сборка",
  PACKAGING: "Упаковка",
  OTHER: "Другое",
}

export default function EditServicePage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "MANUFACTURING",
    pricePerDay: "",
    capacity: "",
    location: "",
    technicalSpecs: "",
  })

  useEffect(() => {
    loadService()
  }, [serviceId])

  const loadService = async () => {
    try {
      const service = await api.get<Service>(`/services/${serviceId}`)
      setFormData({
        title: service.title,
        description: service.description,
        category: service.category,
        pricePerDay: service.pricePerDay.toString(),
        capacity: service.totalCapacity.toString(),
        location: service.location,
        technicalSpecs: service.technicalSpecs || "",
      })
    } catch (error) {
      console.error("Ошибка загрузки услуги:", error)
      alert("Не удалось загрузить услугу")
      router.back()
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.put(`/services/${serviceId}`, {
        title: formData.title,
        description: formData.description,
        pricePerDay: Number.parseFloat(formData.pricePerDay),
        capacity: formData.capacity,
        location: formData.location,
        technicalSpecs: formData.technicalSpecs || undefined,
      })
      router.push("/dashboard/services")
    } catch (error) {
      console.error("Ошибка обновления услуги:", error)
      alert("Не удалось обновить услугу")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">Загрузка...</div>
        </div>
    )
  }

  return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold">Редактировать услугу</h1>
          <p className="text-muted-foreground mt-1">Обновите информацию о вашей производственной мощности</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Название услуги *</Label>
              <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание *</Label>
              <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Категория *</Label>
                <select
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Местоположение *</Label>
                <Input
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pricePerDay">Цена за день (₽) *</Label>
                <Input
                    id="pricePerDay"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Мощность *</Label>
                <Input
                    id="capacity"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Опишите мощность (например: "100 единиц/день")</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicalSpecs">Технические характеристики</Label>
              <Textarea
                  id="technicalSpecs"
                  value={formData.technicalSpecs}
                  onChange={(e) => setFormData({ ...formData, technicalSpecs: e.target.value })}
                  placeholder="Дополнительные технические детали и спецификации"
                  rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Сохранение..." : "Сохранить изменения"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      </div>
  )
}
