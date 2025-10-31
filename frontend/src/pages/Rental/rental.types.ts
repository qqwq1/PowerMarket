export interface IRentalDTO {
  serviceId: number
  startDate: string // ISO DateTime
  endDate: string // ISO DateTime
  message?: string
}

export type TRentalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface IRental {
  id: number
  serviceId: number
  tenantId: number
  supplierId: number
  startDate: string
  endDate: string
  totalPrice?: number
  createdAt?: string | Date
  status?: TRentalStatus
}

// 3апросы (входящие для поставщика, исходящие для арендатора)
export interface IRentalRequest {
  id: number
  serviceId?: number
  serviceTitle?: string
  tenantId?: number
  tenantName?: string
  supplierId?: number
  startDate: string
  endDate: string
  message?: string
  totalPrice?: number
  status: TRentalStatus
  createdAt?: string | Date
}
