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
  id: number
  title: string
  description: string
  category: ServiceCategory
  pricePerDay: number
  totalCapacity: number
  availableCapacity: number
  totalCapacityUnits?: number
  availableCapacityUnits?: number
  location: string
  technicalSpecs?: string
  supplierId: number
  supplierName?: string
  supplier?: User
  active: boolean
  averageRating?: number
  totalReviews?: number
  createdAt?: string
  availabilities?: ServiceAvailability[]
}

export interface ServiceAvailability {
  id: number
  availableDate: string
  isReserved: boolean
  rentalId?: number
}

export type RentalStatus = 'PENDING' | 'IN_CONTRACT' | 'CONFIRMED' | 'IN_RENT' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'

export interface RentalRequest {
  id: number
  serviceId?: number
  serviceTitle?: string

  tenantId: string
  tenantName: string
  tenantInn: string
  tenantEmail: string
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
  serviceId: number
  serviceTitle: string
  supplierId: number
  supplierName: string
  tenantId: number
  tenantName: string
  startDate: string
  endDate: string
  totalPrice: number
  chatId?: string // добавлено поле chatId для связи с чатом
  supplierConfirmed: boolean
  tenantConfirmed: boolean
  supplierConfirmedAt?: string
  tenantConfirmedAt?: string
  status: 'PENDING' | 'IN_CONTRACT' | 'CONFIRMED' | 'IN_RENT' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
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
  createdAt: string //ISO String -  2025-11-10T21:25:13.834658Z
  id: string
  recentMessages: ChatMessage[]
  rentalId: string
  supplierId: string
  supplierName: string
  tenantId: string
  tenantName: string
}

export interface ChatMessage {
  chatId: string
  content: number
  id: string
  senderId: string
  senderName: string
  sentAt: string // ISO String - 2025-11-10T21:25:19.561836Z
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
