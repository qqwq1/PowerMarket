export interface IEquipmentLot {
  id: string

  title: string
  description: string
  category: TEquipmentLotCategory
  pricePerDay: 0
  location: string

  totalCapacity: string
  availableCapacity: string

  totalCapacityUnits: 0
  availableCapacityUnits: 0

  technicalSpecs: string

  supplierId: string
  supplierName: string

  active: true

  averageRating: 0
  totalReviews: 0

  createdAt: string // 2025-11-08T08:41:16.614Z
  availabilities: any[]
}

export type TEquipmentLotDto = {
  title: string
  description: string
  category: TEquipmentLotCategory
  pricePerDay: 0
  location: string
  capacity: string
  technicalSpecs: string
  availabilities: IEquipmentAvailability[]
}

export interface IEquipmentAvailability {
  startDate: string //2025-11-08
  endDate: string // 2025-11-08
}

export type TEquipmentLotCategory =
  | 'MANUFACTURING' // Производство
  | 'EQUIPMENT' // Оборудование
  | 'WAREHOUSE' // Складские помещения
  | 'TRANSPORT' // Транспорт
  | 'LABORATORY' // Лабораторные услуги
  | 'PROCESSING' // Обработка
  | 'ASSEMBLY' // Сборка
  | 'TESTING' // Тестирование
  | 'OTHER' // Другое
