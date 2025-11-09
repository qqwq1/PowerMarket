import { IOption } from '@/types/global'
import { TRentalStatus } from './rental.types'

const fieldTypeOptions: IOption<TRentalStatus>[] = [
  { title: 'Не выбрано', value: null },
  { title: 'В процессе', value: 'PENDING' },
  { title: 'Принято', value: 'APPROVED' },
  { title: 'Откланено', value: 'REJECTED' },
]

const rentalStatusTitles: Record<TRentalStatus | null, string> = fieldTypeOptions.reduce((acc, opt) => {
  acc[opt.value] = typeof opt.title === 'string' ? opt.title : '-'
  return acc
}, {} as Record<TRentalStatus | null, string>)

const rentalConstants = { fieldTypeOptions, rentalStatusTitles }

export default rentalConstants
