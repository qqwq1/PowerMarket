import { ReactNode } from 'react'

export type Primitive = number | string

export interface IOption<T extends Primitive> {
  title: string | ReactNode
  value: T
  children?: IOption<T>[]
}
