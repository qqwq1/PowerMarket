import { atom } from 'recoil'
import { IRentalRequest } from './rental.types'

export const mockRentalRequests: IRentalRequest[] = [
  {
    id: 1,
    serviceId: 101,
    serviceTitle: '3D-принтер Anycubic Photon M3',
    tenantId: 201,
    tenantName: 'Иван Иванов',
    supplierId: 301,
    startDate: '2025-11-01T10:00:00Z',
    endDate: '2025-11-03T18:00:00Z',
    message: 'Нужен для прототипирования',
    totalPrice: 3600,
    status: 'PENDING',
    createdAt: '2025-10-30T09:00:00Z',
  },
  {
    id: 2,
    serviceId: 102,
    serviceTitle: 'Фрезерный станок Haas VF-2',
    tenantId: 202,
    tenantName: 'Петр Петров',
    supplierId: 302,
    startDate: '2025-11-05T09:00:00Z',
    endDate: '2025-11-07T17:00:00Z',
    message: 'Для учебных работ',
    totalPrice: 5000,
    status: 'APPROVED',
    createdAt: '2025-10-29T14:30:00Z',
  },
  {
    id: 3,
    serviceId: 103,
    serviceTitle: 'Лазерный гравер Raylogic 11G',
    tenantId: 203,
    tenantName: 'Сидор Сидоров',
    supplierId: 303,
    startDate: '2025-11-10T12:00:00Z',
    endDate: '2025-11-12T16:00:00Z',
    message: 'Гравировка по дереву',
    totalPrice: 4200,
    status: 'REJECTED',
    createdAt: '2025-10-28T11:15:00Z',
  },
]

interface IRentalRequestState {
  items: IRentalRequest[]
}

const rentalRequestAtom = atom<IRentalRequestState>({
  key: 'rentalRequestAtom',
  default: {
    items: mockRentalRequests as any,
  },
})
export default rentalRequestAtom
