export interface IRentalDTO {
  serviceId: number
  startDate: string
  endDate: string
  message?: string
}

export interface IRental {
  id: number
  serviceId: number
  startDate: string
  endDate: string
  message?: string
}
