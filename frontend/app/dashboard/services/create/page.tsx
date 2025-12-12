'use client'

import type React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { format } from 'date-fns'

const categories = [
  'MANUFACTURING', // Производство
  'EQUIPMENT', // Оборудование
  'WAREHOUSE', // Складские помещения
  'TRANSPORT', // Транспорт
  'LABORATORY', // Лабораторные услуги
  'PROCESSING', // Обработка
  'ASSEMBLY', // Сборка
  'TESTING', // Тестирование
  'OTHER', // Другое
]

const categoryLabels: Record<string, string> = {
  MANUFACTURING: 'Производство',
  EQUIPMENT: 'Оборудование',
  WAREHOUSE: 'Складские помещения',
  TRANSPORT: 'Транспорт',
  LABORATORY: 'Лабораторные услуги',
  PROCESSING: 'Обработка',
  ASSEMBLY: 'Сборка',
  TESTING: 'Тестирование',
  OTHER: 'Другое',
}

interface AvailabilityPeriod {
  startDate: Date
  endDate: Date
}

export default function CreateServicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'MANUFACTURING',
    pricePerDay: '',
    maxCapacity: '',
    location: '',
    technicalSpecs: '',
  })
  const [availabilities, setAvailabilities] = useState<AvailabilityPeriod[]>([{ startDate: null, endDate: null }])

  const addAvailabilityPeriod = () => {
    setAvailabilities([...availabilities, { startDate: null, endDate: null }])
  }

  const removeAvailabilityPeriod = (index: number) => {
    if (availabilities.length > 1) {
      setAvailabilities(availabilities.filter((_, i) => i !== index))
    }
  }

  const updateAvailability = (index: number, field: keyof AvailabilityPeriod, value: Date) => {
    const updated = [...availabilities]
    updated[index][field] = value
    console.log(updated)
    setAvailabilities(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validAvailabilities = availabilities.filter((a) => a.startDate && a.endDate)
    if (validAvailabilities.length === 0) {
      alert('Необходимо указать хотя бы один период доступности')
      return
    }

    setLoading(true)

    try {
      await api.post('/services', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        pricePerDay: Number.parseFloat(formData.pricePerDay),
        maxCapacity: formData.maxCapacity,
        location: formData.location,
        technicalSpecs: formData.technicalSpecs || undefined,
        availabilities: validAvailabilities,
      })
      router.push('/dashboard/services')
    } catch (error) {
      console.error('Ошибка создания услуги:', error)
      alert('Не удалось создать услугу. Проверьте все поля.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <h1 className="text-3xl font-bold">Добавить услугу</h1>
        <p className="text-muted-foreground mt-1">Заполните информацию о вашей производственной мощности</p>
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
              placeholder="Например: Производственная линия по упаковке"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Подробное описание услуги, оборудования и возможностей"
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
                placeholder="Город, регион"
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
                placeholder="10000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxCapacity">Мощность *</Label>
              <Input
                id="maxCapacity"
                required
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                placeholder="100 единиц/день"
              />
              <p className="text-xs text-muted-foreground">Опишите мощность (например: "100 единиц/день", "5 линий")</p>
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Периоды доступности *</Label>
                <p className="text-sm text-muted-foreground">Укажите даты, когда услуга будет доступна для аренды</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addAvailabilityPeriod}>
                <Plus className="w-4 h-4 mr-1" />
                Добавить период
              </Button>
            </div>

            <div className="space-y-3">
              {availabilities.map((period, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`start-${index}`}>Дата начала</Label>
                        <Input
                          id={`start-${index}`}
                          type="date"
                          required
                          value={period.startDate ? format(period.startDate, 'yyyy-MM-dd') : ''}
                          onChange={(e) => updateAvailability(index, 'startDate', new Date(e.target.value))}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`end-${index}`}>Дата окончания</Label>
                        <Input
                          id={`end-${index}`}
                          type="date"
                          required
                          value={period.endDate ? format(period.endDate, 'yyyy-MM-dd') : ''}
                          onChange={(e) => updateAvailability(index, 'endDate', new Date(e.target.value))}
                          min={period.endDate?.toISOString() || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    {availabilities.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAvailabilityPeriod(index)}
                        className="mt-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Создание...' : 'Создать услугу'}
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
