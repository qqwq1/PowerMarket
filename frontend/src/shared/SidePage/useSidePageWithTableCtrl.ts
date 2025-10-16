import { useCallback, useMemo, useState } from 'react'
import { EntityWithId } from '@/recoil/useEntity/useEntity.types.ts'

interface IInitialState<T extends EntityWithId> {
  open: boolean
  selectedItem: T | null
}

const useSidePageWithTableCtrl = <T extends EntityWithId>(
  items: T[],
  initialState: IInitialState<T> = { open: false, selectedItem: null }
) => {
  const [selectedItem, setSelectedItem] = useState<T>(initialState.selectedItem)
  const [sidePageOpen, setSidePageOpen] = useState(initialState.open)

  const selected = useMemo(() => {
    return items.find((it) => it.id === selectedItem?.id)
  }, [items, selectedItem])

  const handleCloseAnimationEnd = useCallback(() => {
    setSelectedItem(null)
  }, [])

  const handleItemPageOpen = useCallback((item: T) => {
    setSelectedItem(item)
    setSidePageOpen(true)
  }, [])

  const handleClosePage = useCallback(() => {
    setSidePageOpen(false)
  }, [])

  return { handleCloseAnimationEnd, sidePageOpen, selectedItem: selected, handleItemPageOpen, handleClosePage }
}

export default useSidePageWithTableCtrl
