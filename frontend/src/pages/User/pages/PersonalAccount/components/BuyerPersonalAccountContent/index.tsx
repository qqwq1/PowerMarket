import css from './buyerPersonalAccountContent.module.css'
import SearchInput from '@/shared/Inputs/SearchInput'
import DropdownInput from '@/shared/Inputs/DropdownInput'
import BasicTable from '@/shared/Tables/BasicTable'
import useBuyerPersonalAccount from './useBuyerPersonalAccount'
import rentalConstants from '@/pages/Rental/rental.constants'

const BuyerPersonalAccountContent = () => {
  const ctrl = useBuyerPersonalAccount()

  const renderTable = () => {
    if (ctrl.rentalRequests.length === 0) return <p>Нет заявок. Попробуйте изменить параметры.</p>

    const columns = ['Оборудование', 'ФИО владельца', 'Статус', 'Дата начала', 'Дата окончания', 'Комментарий']
    const values = ctrl.rentalRequests.map((req) => [
      req.serviceTitle ?? '-',
      req.tenantName ?? '-',
      rentalConstants.rentalStatusTitles[req.status] ?? '-',
      req.startDate ? new Date(req.startDate).toLocaleDateString() : '-',
      req.endDate ? new Date(req.endDate).toLocaleDateString() : '-',
      req.message ?? '-',
    ])

    return <BasicTable columns={columns} values={values} />
  }

  return (
    <>
      <div className={css.content}>
        <div className="inline-flex-gap width100">
          <SearchInput
            value={ctrl.filters.query}
            name={'query'}
            onChange={ctrl.onFilterChange}
            placeHolder="Поиск по названию оборудования"
          />
          <DropdownInput
            wrapperStyle={{ width: '25%' }}
            name={'status'}
            onSelect={ctrl.onFilterChange}
            options={rentalConstants.fieldTypeOptions}
            selectedOption={ctrl.filters.status}
            title={'Выберите статус'}
          />
        </div>
        {renderTable()}
      </div>
    </>
  )
}

export default BuyerPersonalAccountContent
