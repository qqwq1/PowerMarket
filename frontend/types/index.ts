export interface User {
  id: number
  email: string
  name: string
  companyName?: string
  role: 'SUPPLIER' | 'TENANT'
  averageRating?: number
}

export type ServiceCategory =
  | 'MANUFACTURING' // Производство
  | 'EQUIPMENT' // Оборудование
  | 'WAREHOUSE' // Складские помещения
  | 'TRANSPORT' // Транспорт
  | 'LABORATORY' // Лабораторные услуги
  | 'PROCESSING' // Обработка
  | 'ASSEMBLY' // Сборка
  | 'TESTING' // Тестирование
  | 'OTHER' // Другое

export interface Service {
  id: string
  title: string
  description: string
  category: ServiceCategory
  pricePerDay: number
  maxCapacity: number
  location: string
  technicalSpecs: string
  supplierId: string
  supplierName: string
  active: boolean
  createdAt: string // 2025-12-07T21:43:22.514991Z
  availableCapacity?: number
}

export interface ServiceAvailability {
  id: number
  availableDate: string
  isReserved: boolean
  rentalId?: number

  serviceId: string
  availablePeriods: Period[]
  reservedPeriods: Period[]
}

export interface Period {
  startDate: string
  endDate: string
  availableCapacity: number
}

export type RentalStatus = 'PENDING' | 'IN_CONTRACT' | 'CONFIRMED' | 'IN_RENT' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'

export type Stats = {
  totalRentals: number
  activeRentals: number
  completedRentals: number
  totalRevenue: number
  averageRating: number
}
export interface RentalRequest {
  id: string
  rentalId: Rental['id']
  serviceId: Service['id']
  serviceTitle?: Service['title']

  tenantId: User['id']
  tenantName: User['name']
  tenantInn: string
  tenantEmail: User['email']
  tenantPhone: string

  startDate: string
  endDate: string
  message?: string
  totalPrice: number
  status: RentalStatus
  createdAt?: string
  respondedAt?: string
  rejectionReason?: string
  capacityNeeded: number
}

export interface Rental {
  id: string
  serviceId: Service['id']
  rentalRequestId: RentalRequest['id']
  serviceTitle: Service['title']
  supplierId: User['id']
  supplierName: User['name']
  tenantId: User['id']
  tenantName: User['name']
  requestedCapacity: number
  serviceMaxCapacity: number
  startDate: string
  endDate: string
  totalPrice: number
  chatId: Chat['id']
  supplierConfirmed: boolean
  tenantConfirmed: boolean
  supplierConfirmedAt: string
  tenantConfirmedAt: string
  status: RentalStatus
  isActive: boolean
  createdAt: string
}

export interface Review {
  id: number
  rentalId: number
  reviewerId: number
  reviewer?: User
  reviewedUserId: number
  reviewedUser?: User
  serviceId: number
  service?: Service
  rating: number
  comment?: string
  createdAt: string
}

export interface Chat {
  id: string
  rentalId: Rental['id']
  rentalTitle: string
  counterpartId: string
  counterpartName: string
  counterpartRole: string
  lastMessagePreview: ChatMessage
  lastMessageTime: string //2025-12-12T16:10:08.469168Z
  unreadCount: number
  createdAt: string
}
export interface ChatDetails {
  id: string
  rentalId: Rental['id']
  rentalTitle: string
  supplierId: string
  supplierName: string
  tenantId: string
  tenantName: User['name']
  createdAt: string
  updatedAt: string
  recentMessages: ChatMessage
  lastMessage: ChatMessage[]
  unreadMessagesCount: number
  counterpartId: string
  counterpartName: string
  counterpartRole: string
}

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  senderName: User['name']
  content: string
  sentAt: string
  readAt: string
  edited: boolean
  editedAt: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export type ProductionAnalysisDashboardResponse = {
  role: string
  period: {
    from: string
    to: string
  }
  summary: {
    activeOrders: number
    completedOrders: number
    totalAmount: number
    pendingRequests: number
  }
  charts: {
    statusesChart: {
      totalOrders: number
      items: Array<{
        status: string
        label: string
        count: number
      }>
    }
    incomeChart: {
      currency: string
      groupBy: string
      points: Array<{
        periodLabel: string
        periodStart: string
        totalAmount: number
        completedOrders: number
      }>
    }
  }
}
