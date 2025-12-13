'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card } from '@/components/ui/card'
import { Factory, TrendingUp, BarChart3, Download } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useState } from 'react'
import { useCallback } from 'react'
import { ProductionAnalysisDashboardResponse } from '@/types'
import { api } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import { MainLayout } from '@/components/layout/dashboard-layout'

function ProductionAnalysisPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [exportFrom, setExportFrom] = useState('')
  const [exportTo, setExportTo] = useState('')
  const [exportLoading, setExportLoading] = useState(false)

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const supplierId = user?.id
      const url = `/v1/services/export/period?supplierId=${supplierId}&from=${exportFrom}&to=${exportTo}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Ошибка экспорта')
      const blob = await response.blob()
      const disposition = response.headers.get('Content-Disposition')
      let filename = 'export.xlsx'
      if (disposition) {
        const match = disposition.match(/filename="(.+)"/)
        if (match) filename = match[1]
      }
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (e: any) {
      // Можно добавить toast или alert при ошибке
    } finally {
      setExportLoading(false)
    }
  }
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
  const [data, setData] = useState<ProductionAnalysisDashboardResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (from: Date, to: Date) => {
    setLoading(true)
    setError(null)
    try {
      const format = (d: Date) => d.toISOString().slice(0, 10)
      const res = await api.get<ProductionAnalysisDashboardResponse>(
        `/v1/pa/dashboard?from=${format(from)}&to=${format(to)}`
      )
      setData(res)
    } catch (e: any) {
      setError(e instanceof Error ? JSON.parse(e.message)?.error : 'Ошибка')
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

    if (user && user.role === 'SUPPLIER') {
      fetchData(dates.dateFrom, dates.dateTo)
    }
  }, [user, dates.dateFrom, dates.dateTo])

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
      {/* Модальное окно экспорта */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Экспорт данных за период</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="exportFrom">Дата начала</Label>
              <Input id="exportFrom" type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exportTo">Дата окончания</Label>
              <Input id="exportTo" type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <Button onClick={handleExport} disabled={exportLoading || !exportFrom || !exportTo} className="flex-1">
              {exportLoading ? 'Экспорт...' : 'Выполнить экспорт'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setExportOpen(false)} disabled={exportLoading}>
              Отмена
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {loading && <div className="py-4 text-sm text-muted-foreground">Загрузка данных...</div>}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight m-0">Производственный анализ</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setExportOpen(true)} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Экспортировать по датам
          </Button>
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
      </div>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        {!error ? (
          'Базовый обзор ключевых показателей по использованию производственных мощностей.'
        ) : (
          <div className="py-4 text-sm text-red-500">{error}</div>
        )}
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
                  {(data?.charts.statusesChart.items || []).map((entry) => (
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
            {/* Столбчатая диаграмма дохода */}
          </Card>
        </div>
        <div className="w-full md:w-[70%]">
          <Card className="p-6">
            <div className="mt-8 w-full">
              <h2 className="text-lg font-semibold mb-4">Доход по периодам</h2>
              <ResponsiveContainer width="100%" height={270}>
                <BarChart
                  data={data?.charts.incomeChart.points || []}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodLabel" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString()} ₽`}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="totalAmount" name="Доход" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default () => (
  <MainLayout>
    <ProductionAnalysisPage />
  </MainLayout>
)
