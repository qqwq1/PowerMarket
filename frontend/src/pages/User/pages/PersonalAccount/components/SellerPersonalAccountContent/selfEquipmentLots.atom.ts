import { IEquipmentLot } from '@/pages/EquipmentLot/equipmentLot.types'
import { atom } from 'recoil'

export interface IEquipmentLotState {
  items: IEquipmentLot[]
}

const selfEquipmentLotsAtom = atom<IEquipmentLotState>({
  key: 'selfEquipmentLots',
  default: {
    items: [],
  },
})
export default selfEquipmentLotsAtom
