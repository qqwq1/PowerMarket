import { ProductionAnalysisDashboardResponse } from '@/types'

export const MOCK_PRODUCTION_ANALYSIS_DASHBOARD: ProductionAnalysisDashboardResponse = {
  role: 'SUPPLIER',
  period: {
    from: '2024-01-01',
    to: '2024-01-31',
  },
  summary: {
    activeOrders: 4,
    completedOrders: 10,
    totalAmount: 243000.0,
    pendingRequests: 3,
  },
  charts: {
    statusesChart: {
      totalOrders: 22,
      items: [
        { status: 'AWAITING_ACCEPTANCE', label: 'Не принят', count: 3 },
        { status: 'ACCEPTED', label: 'Принят', count: 5 },
        { status: 'IN_PROGRESS', label: 'В работе', count: 4 },
        { status: 'COMPLETED', label: 'Выполнен', count: 8 },
        { status: 'CANCELLED', label: 'Отменён', count: 2 },
      ],
    },
    incomeChart: {
      currency: 'RUB',
      groupBy: 'month',
      points: [
        {
          periodLabel: 'Янв 2024',
          periodStart: '2024-01-01',
          totalAmount: 145000.0,
          completedOrders: 5,
        },
        {
          periodLabel: 'Фев 2024',
          periodStart: '2024-02-01',
          totalAmount: 98000.0,
          completedOrders: 3,
        },
      ],
    },
  },
}
