import { atom } from 'recoil'
import { IEquipmentLot } from './equipmentLot.types'

export interface IEquipmentLotFiltersState {
  category: IEquipmentLot['category'] | null
  location: IEquipmentLot['location'] | null
  price: [number, number]
  status: IEquipmentLot['status'] | null
}

const equipmentLotFiltersAtom = atom<IEquipmentLotFiltersState>({
  key: 'equipmentLotFilters',
  default: {
    category: '',
    location: '',
    price: [null, null],
    status: null,
  },
})
export default equipmentLotFiltersAtom
