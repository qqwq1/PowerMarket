import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import equipmentLotFiltersAtom, { IEquipmentLotFiltersState } from '../../equipmentLotFilters.atom'
import equipmentLotApi from '../../equipmentLot.api'
import useHttpLoader from '@/shared/hooks/useHttpLoader'
import { IEquipmentLot } from '../../equipmentLot.types'

const useEquipmentCatalog = () => {
  const [equipmentLots, setEquipmentLots] = useState<IEquipmentLot[]>([])
  const [filtersState, setFiltersState] = useRecoilState(equipmentLotFiltersAtom)
  const { wait } = useHttpLoader()

  useEffect(() => {
    wait(
      equipmentLotApi.searchEquipmentLots({
        ...filtersState,
      }),
      (resp) => {
        if (resp.status === 'success') {
          setEquipmentLots(resp.body.content)
        }
      }
    )
  }, [filtersState])

  const handleFilterChange = <T extends keyof IEquipmentLotFiltersState>(
    value: IEquipmentLotFiltersState[T],
    key: T
  ) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }))
  }

  return { equipmentLots, handleFilterChange, filtersState }
}

export default useEquipmentCatalog
