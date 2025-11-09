import { IEquipmentLot } from '../EquipmentLot/equipmentLot.types'

export type TRentalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// 3апросы (входящие для поставщика, исходящие для арендатора)
export interface IRentalRequest {
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
  status: TRentalStatus
  createdAt?: string
  respondedAt?: string
  rejectionReason?: string
  capacityNeeded: number
}

export interface IRentalRequestCreateDto {
  serviceId: IEquipmentLot['id']
  startDate: string
  endDate: string
  capacityNeeded: number
}
