import { ReactNode } from 'react'

export interface IDropdownOption {
  title: string | ReactNode
  value: any
}

export interface IDropdownGroupOption {
  key: string
  title: string
  children: Array<IDropdownOption | IDropdownGroupOption>
}

export type TDropdownOption = IDropdownGroupOption | IDropdownOption
