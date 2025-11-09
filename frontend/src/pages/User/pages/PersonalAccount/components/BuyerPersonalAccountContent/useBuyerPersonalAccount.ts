import rentalApi from '@/pages/Rental/rental.api'
import rentalRequestAtom from '@/pages/Rental/rentalRequest.atom'
import useHttpLoader from '@/shared/hooks/useHttpLoader'
import useStateWithChange from '@/shared/hooks/useStateWithChange'
import { useMemo, useEffect } from 'react'
import { useRecoilState } from 'recoil'

const useBuyerPersonalAccount = () => {
  const { wait } = useHttpLoader()
  const [rentalRequestState, setRentalRequestState] = useRecoilState(rentalRequestAtom)
  const [filters, _, handleChangeFilters] = useStateWithChange({
    query: '',
    status: null,
  })

  useEffect(() => {
    if (rentalRequestState.items.length === 0) {
      wait(rentalApi.getSelfRentalRequests(), (resp) => {
        if (resp.status === 'success') setRentalRequestState((prev) => ({ ...prev, items: resp.body }))
      })
    }
  }, [])

  const rentalRequestsFiltred = useMemo(() => {
    return rentalRequestState.items.filter((req) => {
      const titleMatch =
        !filters.query.trim() || (req.serviceTitle ?? '').toLowerCase().includes(filters.query.trim().toLowerCase())
      const statusMatch = !filters.status || req.status === filters.status
      return true && statusMatch && titleMatch
    })
  }, [rentalRequestState, filters])

  return { onFilterChange: handleChangeFilters, rentalRequests: rentalRequestsFiltred, filters }
}

export default useBuyerPersonalAccount
