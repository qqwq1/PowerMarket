import { IRentalRequest, TRentalStatus } from '@/pages/Rental/rental.types'
import useHttpLoader from '@/shared/hooks/useHttpLoader'
import { useCallback, useState } from 'react'

const useRespondRentalRequest = (id: IRentalRequest['id']) => {
  const [rentalStatus, setRentalStatus] = useState<TRentalStatus>('PENDING')
  const { wait, loading } = useHttpLoader()

  const approveRentalRequest = useCallback(() => {
    setRentalStatus('APPROVED')
    console.log(id)
  }, [id])

  const rejectRentalRequest = useCallback(() => {
    setRentalStatus('REJECTED')
    console.log(id)
  }, [id])

  return {
    approveRentalRequest,
    rejectRentalRequest,
    rentalStatus,
    loading,
  }
}

export default useRespondRentalRequest
