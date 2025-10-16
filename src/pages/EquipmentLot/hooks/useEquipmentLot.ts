import { useRecoilValue } from 'recoil'
import { IEquipmentLot } from '../equipmentLot.types'
import equipmentLotAtom from '../equipmentLot.atom'
import { useMemo } from 'react'

const useEquipmentLot = (id: IEquipmentLot['id']) => {
  const equipmentLots = useRecoilValue(equipmentLotAtom).items

  return useMemo(() => {
    return equipmentLots.find((e) => e.id === id)
  }, [equipmentLots])
}

export default useEquipmentLot
