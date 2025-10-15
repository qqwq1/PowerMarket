import { atom } from 'recoil'
import { IEquipmentLot } from './equipmentLot.types'

export interface IEquipmentLotState {
  items: IEquipmentLot[]
  loaded: boolean
}

const equipmentLotAtom = atom<IEquipmentLotState>({
  key: 'equipmentLots',
  default: {
    items: [],
    loaded: false,
  },
})
export default equipmentLotAtom
