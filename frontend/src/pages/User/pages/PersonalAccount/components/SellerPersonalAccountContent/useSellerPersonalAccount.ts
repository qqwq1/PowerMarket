import { useRecoilState } from 'recoil'
import selfEquipmentLotsAtom from './selfEquipmentLots.atom'
import { useEffect, useMemo, useState } from 'react'
import supplierApi from './supplier.api'
import useHttpLoader from '@/shared/hooks/useHttpLoader'

const useSellerPersonalAccount = () => {
  const [selfEquipmentLotsState, setSelfEquipmentLotsState] = useRecoilState(selfEquipmentLotsAtom)
  const { wait } = useHttpLoader()
  const [filters, setFilters] = useState('')

  useEffect(() => {
    if (selfEquipmentLotsState.items.length === 0) {
      wait(supplierApi.getSelfEquipmentLots(), (resp) => {
        if (resp.status === 'success') {
          setSelfEquipmentLotsState((prev) => ({ ...prev, items: resp.body }))
        }
      })
    }
  }, [])

  const filteredLots = useMemo(() => {
    const search = filters.trim().toLowerCase()
    if (!search) return selfEquipmentLotsState.items
    return selfEquipmentLotsState.items.filter((item) => item.title.toLowerCase().includes(search))
  }, [filters, selfEquipmentLotsState])

  return {
    selfEquipmentLots: filteredLots,
    onFiltersChange: setFilters,
    filters,
  }
}

export default useSellerPersonalAccount
