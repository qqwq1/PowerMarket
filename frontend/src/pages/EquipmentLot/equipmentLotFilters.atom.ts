import { atom } from 'recoil'
import { IEquipmentLot, TEquipmentLotCategory } from './equipmentLot.types'

export interface IEquipmentLotFiltersState {
  category: TEquipmentLotCategory | null
  location: IEquipmentLot['location'] | null
  price: [number, number]
}

const equipmentLotFiltersAtom = atom<IEquipmentLotFiltersState>({
  key: 'equipmentLotFilters',
  default: {
    category: null,
    location: '',
    price: [null, null],
  },
})
export default equipmentLotFiltersAtom
