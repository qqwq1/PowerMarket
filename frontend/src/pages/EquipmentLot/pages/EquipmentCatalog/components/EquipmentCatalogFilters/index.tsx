import { IEquipmentLotFiltersState } from '../../../../equipmentLotFilters.atom'

import DropdownInput from '../../../../../../shared/Inputs/DropdownInput'
import Button from '../../../../../../shared/Buttons/Button'
import { IOption } from '../../../../../../types/global'
import { IEquipmentLot } from '../../../../equipmentLot.types'
import TextInput from '../../../../../../shared/Inputs/TextInput'

interface IProps {
  filters: IEquipmentLotFiltersState
  handleChange: <T extends keyof IEquipmentLotFiltersState>(value: IEquipmentLotFiltersState[T], key: T) => void
  applyFilters: () => void
}

const EquipmentCatalogFilters = (props: IProps) => {
  const fieldTypeOptions: IOption<IEquipmentLot['category']>[] = [
    { title: 'Не выбрано', value: null },
    { title: 'Металлообработка', value: 'metalworking' },
    { title: '3D-печать', value: '3d-print' },
    { title: 'Станки с ЧПУ', value: 'cnc-machining' },
    { title: 'Лазерная резка', value: 'laser-cutting' },
    { title: 'Сварочное оборудование', value: 'welding' },
  ]
  const toInputValue = (v: number | null) => (v != null && !isNaN(v) ? String(v) : '')
  const toNumberOrNull = (e: string) => (e === '' ? null : +e)

  return (
    <div className="flex-lines gap8">
      <h3>Фильтры</h3>

      <DropdownInput
        name={'category'}
        onSelect={(e) => props.handleChange(e, 'category')}
        options={fieldTypeOptions}
        selectedOption={props.filters.category}
        title={'Выберите категорию'}
      />
      <div className="inline-flex-gap gap8">
        <TextInput
          placeHolder="от 0"
          value={toInputValue(props.filters.price[0])}
          name="minPrice"
          onChange={(e) => props.handleChange([toNumberOrNull(e), props.filters.price[1]], 'price')}
        />

        <TextInput
          placeHolder="до 9 999"
          value={toInputValue(props.filters.price[1])}
          name="maxPrice"
          onChange={(e) => props.handleChange([props.filters.price[0], toNumberOrNull(e)], 'price')}
        />
      </div>

      <Button fullWidth size="default" type="primary" text="Применить фильтры" onClick={props.applyFilters} />
    </div>
  )
}

export default EquipmentCatalogFilters
