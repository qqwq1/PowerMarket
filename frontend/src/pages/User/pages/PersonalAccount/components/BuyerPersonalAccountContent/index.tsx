import css from './buyerPersonalAccountContent.module.css'
import { useMemo, useState } from 'react'
import SearchInput from '@/shared/Inputs/SearchInput'
import DropdownInput from '@/shared/Inputs/DropdownInput'
import BasicTable from '@/shared/Tables/BasicTable'
import { useRecoilValue } from 'recoil'
import rentalRequestAtom from '@/pages/Rental/rentalRequest.atom'
import { IOption } from '@/types/global'
import { TRentalStatus } from '@/pages/Rental/rental.types'

const fieldTypeOptions: IOption<TRentalStatus>[] = [
  { title: 'Не выбрано', value: null },
  { title: 'В процессе', value: 'PENDING' },
  { title: 'Принято', value: 'APPROVED' },
  { title: 'Откланено', value: 'REJECTED' },
]

const BuyerPersonalAccountContent = () => {
  const rentalRequestsState = useRecoilValue(rentalRequestAtom)
  const [filters, setFilters] = useState({
    query: '',
    status: null,
  })

  const rentalRequestsFiltred = useMemo(() => {
    return rentalRequestsState.items.filter((req) => {
      // const titleMatch = !filters.query.trim() || (req.serviceTitle ?? '').toLowerCase().includes(filters.query.trim().toLowerCase())
      const statusMatch = !filters.status || req.status === filters.status
      return true && statusMatch
    })
  }, [rentalRequestsState, filters])

  const renderTable = () => {
    if (rentalRequestsFiltred.length === 0) return <p>Нет заявок.</p>

    const columns = ['ID', 'Оборудование', 'Статус', 'Дата начала', 'Дата окончания', 'Комментарий']
    const values = rentalRequestsFiltred.map((req) => [
      req.id,
      req.serviceTitle ?? '',
      req.status ?? '',
      req.startDate ? new Date(req.startDate).toLocaleDateString() : '',
      req.endDate ? new Date(req.endDate).toLocaleDateString() : '',
      req.message ?? '',
    ])

    return <BasicTable columns={columns} values={values} />
  }

  return (
    <>
      <div className={css.content}>
        <div className="inline-flex-gap width100">
          <SearchInput
            value={filters.query}
            name={'query'}
            onChange={(v) => setFilters((prev) => ({ ...prev, query: v }))}
            placeHolder="Поиск по названию оборудования"
          />
          <DropdownInput
            wrapperStyle={{ width: '25%' }}
            name={'rentalStatus'}
            onSelect={(e) => setFilters((prev) => ({ ...prev, status: e }))}
            options={fieldTypeOptions}
            selectedOption={filters.status}
            title={'Выберите статус'}
          />
        </div>
        {renderTable()}
      </div>
    </>
  )
}

export default BuyerPersonalAccountContent
