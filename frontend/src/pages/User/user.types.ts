export type TUserRole = 'ADMIN' | 'SUPPLIER' | 'TENANT'

export interface IUser {
  id: number
  email: string
  role: TUserRole
  fullName: string
  companyName?: string
  inn?: string
  phone?: string
  address?: string
  createdAt?: string | Date
}

export type TUserDto = Omit<IUser, 'id' | 'createdAt'>
