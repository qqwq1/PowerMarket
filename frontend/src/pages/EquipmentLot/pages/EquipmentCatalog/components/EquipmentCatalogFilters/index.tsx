import { IEquipmentLotFiltersState } from '@/pages/EquipmentLot/equipmentLotFilters.atom'

import DropdownInput from '@/shared/Inputs/DropdownInput'
import equipmentLotCreateConstants from '../../../EquipmentLotCreate/equipmentLotCreate.constants'
import AntDateRangePicker from '@/shared/Forms/DatePickers/AntDateRangePicker'
import timeUtils from '@/utils/time.utils'
import SearchInput from '@/shared/Inputs/SearchInput'

interface IProps {
  filters: IEquipmentLotFiltersState
  handleChange: <T extends keyof IEquipmentLotFiltersState>(value: IEquipmentLotFiltersState[T], key: T) => void
}

const EquipmentCatalogFilters = (props: IProps) => {
  const handleRangeChange = (startTs: number, endTs: number) => {
    const startDate = startTs ? timeUtils.formatDate(startTs, 'yyyy-MM-dd') : ''
    const endDate = endTs ? timeUtils.formatDate(endTs, 'yyyy-MM-dd') : ''
    props.handleChange(startDate, 'startDate')
    props.handleChange(endDate, 'endDate')
  }

  return (
    <div className="flex-lines gap8">
      <h3>Фильтры</h3>

      <DropdownInput
        name={'category'}
        onSelect={(e) => props.handleChange(e, 'category')}
        options={equipmentLotCreateConstants.categoryOptions}
        selectedOption={props.filters.category}
        title={'Выберите категорию'}
      />
      <SearchInput
        placeHolder="Поиск производственных мощностей"
        value={props.filters.keyword}
        name="keyword"
        onChange={(e) => props.handleChange(e.trim(), 'keyword')}
      />
      <AntDateRangePicker
        withTime={false}
        onChange={(startTs, endTs) => handleRangeChange(startTs, endTs)}
        allowSelectInFuture
        startTs={props.filters.startDate ? Date.parse(props.filters.startDate) : null}
        endTs={props.filters.endDate ? Date.parse(props.filters.endDate) : null}
        panelStyle={{ width: '100%' }}
      />
    </div>
  )
}

export default EquipmentCatalogFilters
