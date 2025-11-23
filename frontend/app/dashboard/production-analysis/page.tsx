'use client'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  AWAITING_ACCEPTANCE: '#6B7280', // серый
  ACCEPTED: '#2563EB', // синий
  IN_PROGRESS: '#F59E42', // оранжевый
  COMPLETED: '#22C55E', // зелёный
  CANCELLED: '#EF4444', // красный
}
const STATUS_LABELS: Record<string, string> = {
  AWAITING_ACCEPTANCE: 'Не принят',
  ACCEPTED: 'Принят',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Выполнен',
  CANCELLED: 'Отменён',
}

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card } from '@/components/ui/card'
import { Factory, TrendingUp, BarChart3 } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useState } from 'react'
import { useCallback } from 'react'
import { ProductionAnalysisDashboardResponse } from '@/types'
import { MOCK_PRODUCTION_ANALYSIS_DASHBOARD } from './mockData'

export default function ProductionAnalysisPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [period, setPeriod] = useState('7')
  const [dates, setDates] = useState(() => {
    const now = new Date()
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    const from = new Date(now)
    from.setDate(from.getDate() - 6)
    from.setHours(0, 0, 0, 0)
    return { dateFrom: from, dateTo: to }
  })
  const [data, setData] = useState<ProductionAnalysisDashboardResponse | null>(MOCK_PRODUCTION_ANALYSIS_DASHBOARD)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (from: Date, to: Date) => {
    setLoading(true)
    setError(null)
    try {
      const format = (d: Date) => d.toISOString().slice(0, 10)
      const res = await fetch(`/api/v1/pa/dashboard?from=${format(from)}&to=${format(to)}`)
      if (!res.ok) throw new Error('Ошибка загрузки данных')
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message || 'Ошибка')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePeriodChange = (value: string) => {
    setPeriod(value)
    const now = new Date()
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    let days = 7
    if (value === '14') days = 14
    if (value === '30') days = 30
    const from = new Date(now)
    from.setDate(from.getDate() - (days - 1))
    from.setHours(0, 0, 0, 0)
    setDates({ dateFrom: from, dateTo: to })
    fetchData(from, to)
  }

  useEffect(() => {
    if (user && user.role !== 'SUPPLIER') {
      router.replace('/dashboard')
    }
  }, [user, router])

  // useEffect(() => {
  //   if (user && user.role === 'SUPPLIER') {
  //     fetchData(dates.dateFrom, dates.dateTo)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [user, dates.dateFrom, dates.dateTo])

  // Пока не знаем пользователя — можно показать простой лоадер
  if (!user) {
    return <div className="py-10 text-sm text-muted-foreground">Загрузка...</div>
  }

  if (user.role !== 'SUPPLIER') {
    // Мгновенно ничего не рендерим (редирект уже инициирован)
    return null
  }

  return (
    <div className="space-y-8">
      {loading && <div className="py-4 text-sm text-muted-foreground">Загрузка данных...</div>}
      {error && <div className="py-4 text-sm text-red-500">{error}</div>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Производственный анализ</h1>
        </div>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Период" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Последние 7 дней</SelectItem>
            <SelectItem value="14">Последние 14 дней</SelectItem>
            <SelectItem value="30">Последний месяц</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Базовый обзор ключевых показателей по использованию производственных мощностей.
      </p>

      <div className="flex-1 grid gap-6 md:grid-cols-4">
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4" /> Активные заказы
          </div>
          <div className="text-3xl font-semibold">{data?.summary.activeOrders ?? '--'}</div>
          <p className="text-xs text-muted-foreground">Текущие активные заказы</p>
        </Card>
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="h-4 w-4" /> Завершенные за период
          </div>
          <div className="text-3xl font-semibold">{data?.summary.completedOrders ?? '--'}</div>
          <p className="text-xs text-muted-foreground">Заказы, завершённые за выбранный период</p>
        </Card>
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Factory className="h-4 w-4" /> Доход за период
          </div>
          <div className="text-3xl font-semibold">
            {data?.summary.totalAmount ? `${data.summary.totalAmount.toLocaleString()} ₽` : '--'}
          </div>
          <p className="text-xs text-muted-foreground">Суммарный доход за выбранный период</p>
        </Card>
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4" /> В обработке
          </div>
          <div className="text-3xl font-semibold">
            {data?.charts?.statusesChart?.items?.find((i) => i.status === 'AWAITING_ACCEPTANCE')?.count ?? '--'}
          </div>
          <p className="text-xs text-muted-foreground">Заявки, ожидающие принятия</p>
        </Card>
      </div>
      <div className="flex gap-8">
        <div className="w-full md:w-[30%]">
          <Card className="p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-4">Статусы заказов</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data?.charts.statusesChart.items || []}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  label={false}
                >
                  {(data?.charts.statusesChart.items || []).map((entry, idx) => (
                    <Cell key={`cell-${entry.status}`} fill={STATUS_COLORS[entry.status] || '#ccc'} />
                  ))}
                </Pie>
                {/* Центр: общее число заказов */}
                <text
                  x={'50%'}
                  y={'50%'}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={24}
                  fontWeight="bold"
                  fill="#222"
                >
                  {data?.charts.statusesChart.totalOrders ?? '--'}
                </text>
              </PieChart>
            </ResponsiveContainer>
            {/* Легенда */}
            <div className="mt-6 w-full">
              {(data?.charts.statusesChart.items || []).map((entry) => {
                const percent = data?.charts.statusesChart.totalOrders
                  ? Math.round((entry.count / data.charts.statusesChart.totalOrders) * 100)
                  : 0
                return (
                  <div key={entry.status} className="flex items-center gap-2 mb-2 text-sm">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ background: STATUS_COLORS[entry.status] || '#ccc' }}
                    />
                    <span className="w-28">{STATUS_LABELS[entry.status] || entry.label}</span>
                    <span className="font-medium">{entry.count}</span>
                    <span className="text-muted-foreground">({percent}%)</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
