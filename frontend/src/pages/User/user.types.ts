export type TUserRole = 'seller' | 'buyer'

export type Role = 'ADMIN' | 'SUPPLIER' | 'TENANT'

export interface User {
  id: number
  email: string
  role: Role
  fullName: string
  companyName?: string
  inn?: string
  phone?: string
  address?: string
  createdAt?: string | Date
}
