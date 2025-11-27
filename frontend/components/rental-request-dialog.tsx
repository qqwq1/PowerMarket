'use client'

import type React from 'react'

import { useState, useMemo } from 'react'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { api } from '@/lib/api'
import type { Service } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

interface RentalRequestDialogProps {
  service: Service
  onClose: () => void
  onSuccess: (rentalRequestId: string) => void
}

export function RentalRequestDialog({ service, onClose, onSuccess }: RentalRequestDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    capacityNeeded: '1',
  })

  const daysBetween = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0
    const start = parseISO(formData.startDate)
    const end = parseISO(formData.endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
    const diff = differenceInCalendarDays(end, start) + 1
    return diff > 0 ? diff : 0
  }, [formData.startDate, formData.endDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post<{ id: string }>('/rental-requests', {
        serviceId: service.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        capacityNeeded: Number.parseInt(formData.capacityNeeded),
      })
      onSuccess(response.id)
    } catch (error) {
      console.error('Ошибка создания заявки:', error)
      alert('Не удалось создать заявку')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    const days = daysBetween
    const capacity = Number.parseInt(formData.capacityNeeded) || 0
    return days * capacity * service.pricePerDay
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold ">Заявка на аренду</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="text-lg font-semibold mb-1">{service.title}</div>
            <div className="text-sm text-muted-foreground">{service.location}</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Дата начала *</Label>
              <Input
                id="startDate"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Дата окончания *</Label>
              <Input
                id="endDate"
                type="date"
                required
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacityNeeded">Требуемая мощность *</Label>
            <Input
              id="capacityNeeded"
              type="number"
              required
              min="1"
              max={service.availableCapacity}
              value={formData.capacityNeeded}
              onChange={(e) => setFormData({ ...formData, capacityNeeded: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Доступно: {service.availableCapacity} единиц</p>
          </div>

          {daysBetween > 0 && Number.parseInt(formData.capacityNeeded) >= 1 && (
            <Card className="p-4 bg-muted">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Количество дней:</span>
                  <span className="font-semibold">{daysBetween}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Цена за день:</span>
                  <span className="font-semibold">{service.pricePerDay.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Мощность:</span>
                  <span className="font-semibold">{formData.capacityNeeded}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-base">
                  <span className="font-semibold">Итого:</span>
                  <span className="font-bold text-lg">{calculateTotal().toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading || daysBetween === 0 || Number.parseInt(formData.capacityNeeded) < 1}
              className="flex-1"
            >
              {loading ? 'Отправка...' : 'Отправить заявку'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Отмена
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
