import { atom } from 'recoil'
import { TEquipmentLotCategory } from './equipmentLot.types'

export interface IEquipmentLotFiltersState {
  category: TEquipmentLotCategory | null
  keyword: string
  startDate: null | string
  endDate: null | string
  page: number
}

const equipmentLotFiltersAtom = atom<IEquipmentLotFiltersState>({
  key: 'equipmentLotFilters',
  default: {
    category: null,
    keyword: '',
    startDate: null,
    endDate: null,
    page: 0,
  },
})
export default equipmentLotFiltersAtom
