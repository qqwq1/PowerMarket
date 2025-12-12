'use client'

import type React from 'react'

import { useState, useMemo, useCallback, useEffect, FormEvent, ChangeEvent } from 'react'
import {
  addYears,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isValid,
  parseISO,
  startOfMonth,
} from 'date-fns'
import { api } from '@/lib/api'
import type { Service, ServiceAvailability } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { X } from 'lucide-react'
import { DateRange } from 'react-day-picker'

interface RentalRequestDialogProps {
  service: Service
  onClose: () => void
  onSuccess: (rentalRequestId: string) => void
}

export function RentalRequestDialog({ service, onClose, onSuccess }: RentalRequestDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [availabilityLoading, setAvailabilityLoading] = useState(true)
  const [formData, setFormData] = useState<{
    startDate: Date | null
    endDate: Date | null
    capacityNeeded: number
  }>({
    startDate: null,
    endDate: null,
    capacityNeeded: 1,
  })
  const [availability, setAvailability] = useState<ServiceAvailability | null>(null)
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfMonth(new Date()))

  const daysBetween = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0
    const start = formData.startDate
    const end = formData.endDate
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
    const diff = differenceInCalendarDays(end, start) + 1
    return diff > 0 ? diff : 0
  }, [formData.startDate, formData.endDate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      console.log(formData)
      const response = await api.post<{ id: string }>('/rental-requests', {
        serviceId: service.id,
        startDate: format(formData.startDate, 'yyyy-MM-dd'),
        endDate: format(formData.endDate, 'yyyy-MM-dd'),
        capacityNeeded: formData.capacityNeeded,
      })
      onSuccess(response.id)
    } catch (error) {
      console.error('Ошибка создания заявки:', error)
      alert('Не удалось создать заявку')
    } finally {
      setSubmitting(false)
    }
  }

  const getAvailability = useCallback(
    async (serviceId: Service['id'], month: Date) => {
      setAvailabilityLoading(true)
      const startDate = format(startOfMonth(month), 'yyyy-MM-dd')
      const endDate = format(endOfMonth(month), 'yyyy-MM-dd')

      try {
        const data = await api.get<ServiceAvailability>(
          `/availability/service/${serviceId}/detailed?startDate=${startDate}&endDate=${endDate}`
        )
        setAvailability(data)
      } catch (error) {
        onClose()
        console.error('Ошибка загрузки услуги:', error)
        alert('Не удалось загрузить услугу')
      } finally {
        setAvailabilityLoading(false)
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (!service) return
    getAvailability(service.id, calendarMonth)
  }, [service, calendarMonth, getAvailability])

  const availabilityByDay = useMemo(() => {
    if (!availability) return new Map<string, { availableCapacity?: number; reservedCapacity?: number }>()

    const map = new Map<string, { availableCapacity?: number; reservedCapacity?: number }>()
    const addPeriodRange = (
      period: { startDate: string; endDate: string; availableCapacity: number },
      key: 'availableCapacity' | 'reservedCapacity'
    ) => {
      const start = parseISO(period.startDate)
      const end = parseISO(period.endDate)
      if (!isValid(start) || !isValid(end)) return

      eachDayOfInterval({ start, end }).forEach((day) => {
        const dayKey = format(day, 'yyyy-MM-dd')
        const current = map.get(dayKey) ?? {}
        const nextValue = Math.max(current[key] ?? 0, period.availableCapacity ?? 0)
        map.set(dayKey, { ...current, [key]: nextValue })
      })
    }

    availability.availablePeriods?.forEach((period) => addPeriodRange(period, 'availableCapacity'))
    availability.reservedPeriods?.forEach((period) => addPeriodRange(period, 'reservedCapacity'))

    return map
  }, [availability])

  const getDayInfo = useCallback(
    (date: Date) => {
      if (!date) return { status: 'unknown', availableCapacity: 0, reservedCapacity: 0, meetsCapacity: false }
      const dayKey = format(date, 'yyyy-MM-dd')
      const info = availabilityByDay.get(dayKey)

      if (!info) {
        return { status: 'unknown', availableCapacity: 0, reservedCapacity: 0, meetsCapacity: false }
      }

      const availableCapacity = info.availableCapacity ?? 0
      const reservedCapacity = info.reservedCapacity ?? 0
      const hasAvailable = availableCapacity > 0
      const hasReserved = reservedCapacity > 0

      const meetsCapacity = availableCapacity >= (formData.capacityNeeded ?? 1)
      let status: string
      switch (true) {
        case !meetsCapacity:
          status = 'unavailable'
          break
        case hasReserved && hasAvailable:
          status = 'partial'
          break
        case hasAvailable:
          status = 'available'
          break
        default:
          status = 'unavailable'
      }

      return { status, availableCapacity, reservedCapacity, meetsCapacity }
    },
    [availabilityByDay, formData.capacityNeeded]
  )

  const modifiers = useMemo(
    () => ({
      reserved: (date: Date) => getDayInfo(date).status === 'reserved',
      partial: (date: Date) => getDayInfo(date).status === 'partial',
      available: (date: Date) => getDayInfo(date).status === 'available',
    }),
    [getDayInfo]
  )

  const modifiersClassNames = useMemo(
    () => ({
      reserved: 'bg-destructive/20 text-destructive border border-destructive/30',
      partial:
        'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-50 border border-amber-200 dark:border-amber-800',
      available:
        'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-50 border border-emerald-200 dark:border-emerald-800',
    }),
    []
  )

  const renderLegend = () => (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {[
        { label: 'Доступно', color: 'bg-emerald-500' },
        { label: 'Частично', color: 'bg-amber-500' },
        { label: 'Занято', color: 'bg-destructive' },
        { label: 'Нет данных', color: 'bg-border' },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )

  const rangeAvailability = useMemo(() => {
    if (!formData.startDate || !formData.endDate) {
      return { minAvailable: service.availableCapacity, hasUnknown: false }
    }

    let minAvailable = Infinity
    let hasUnknown = false

    eachDayOfInterval({ start: formData.startDate, end: formData.endDate }).forEach((day) => {
      const info = availabilityByDay.get(format(day, 'yyyy-MM-dd'))
      if (!info) {
        hasUnknown = true
        return
      }
      const available = info.availableCapacity ?? 0
      minAvailable = Math.min(minAvailable, available)
    })

    if (minAvailable === Infinity) {
      minAvailable = service.availableCapacity
    }

    return { minAvailable, hasUnknown }
  }, [availabilityByDay, formData.endDate, formData.startDate, service.availableCapacity])

  const calculateTotal = () => {
    const days = daysBetween
    const capacity = formData.capacityNeeded || 0
    return days * capacity * service.pricePerDay
  }

  const isSubmitDisabled =
    availabilityLoading ||
    submitting ||
    daysBetween === 0 ||
    !formData.startDate ||
    !formData.endDate ||
    formData.capacityNeeded < 1 ||
    rangeAvailability.hasUnknown ||
    formData.capacityNeeded > (rangeAvailability.minAvailable ?? 0)

  let capacityMax = rangeAvailability.hasUnknown
    ? null
    : Math.max(0, rangeAvailability.minAvailable ?? service.availableCapacity)
  const capacityMin = 1

  const handleCapacityNeededChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      capacityNeeded: Number(e.target.value) ?? 1,
    }))
  }

  const handleDatePickerSelect = (range: DateRange) => {
    setFormData((prev) => ({
      startDate: range?.from,
      endDate: range?.to,
      capacityNeeded: Math.min(prev.capacityNeeded, rangeAvailability.minAvailable ?? Infinity),
    }))
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

          <div className="space-y-2">
            <Label htmlFor="capacityNeeded">Требуемая мощность *</Label>
            <Input
              id="capacityNeeded"
              type="number"
              required
              min={capacityMin}
              max={capacityMax ?? null}
              value={formData.capacityNeeded}
              onChange={handleCapacityNeededChange}
            />
            <p className="text-xs text-muted-foreground">
              {!capacityMax || capacityMax < 1
                ? 'Нет доступных ресурсов в выбранные даты'
                : `Доступно: ${capacityMax} единиц`}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Календарь доступности</span>
              {availabilityLoading && <span className="text-xs text-muted-foreground">Загрузка...</span>}
            </div>

            {availability ? (
              <>
                <div className="w-full">
                  <Calendar
                    mode="range"
                    month={calendarMonth}
                    selected={{ from: formData.startDate, to: formData.endDate }}
                    onSelect={handleDatePickerSelect}
                    onMonthChange={setCalendarMonth}
                    showOutsideDays
                    modifiers={modifiers}
                    modifiersClassNames={modifiersClassNames}
                    captionLayout="dropdown"
                    startMonth={new Date()}
                    endMonth={addYears(new Date(), 1)}
                    className="w-full"
                  />
                </div>
                {renderLegend()}
              </>
            ) : (
              <Card className="p-4 bg-muted">
                <p className="text-sm text-muted-foreground">
                  {availabilityLoading ? 'Загружаем календарь...' : 'Нет данных о доступности'}
                </p>
              </Card>
            )}
          </div>

          {daysBetween > 0 && formData.capacityNeeded >= 1 && (
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
            <Button type="submit" disabled={isSubmitDisabled} className="flex-1">
              {submitting ? 'Отправка...' : 'Отправить заявку'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Отмена
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
