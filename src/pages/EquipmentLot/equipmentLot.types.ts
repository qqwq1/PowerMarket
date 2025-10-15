export interface IEquipmentLot {
  id: string
  title: string
  description: string
  category: string // metalworking, 3d-print...
  price: string // 1500 ₽/час, т.к. может быть не только числом
  location: string // Екатеринбург
  images: string[] // Array of image URLs
  // createdBy: string, // Ссылка на User (contractor)
  status: string // active, moderation, paused
  createdAt: string
}

export type IEquipmentLotStatus = 'active' | 'moderation' | 'paused'
