import { ReactNode } from 'react'

export interface IDropdownOption {
  title: string | ReactNode
  value: any
}

export type TDropdownOption = IDropdownOption
