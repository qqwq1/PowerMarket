import { IEquipmentLotFiltersState } from '@/pages/EquipmentLot/equipmentLotFilters.atom'

interface IProps {
  filters: IEquipmentLotFiltersState
  handleChange: <T extends keyof IEquipmentLotFiltersState>(value: IEquipmentLotFiltersState[T], key: T) => void
  applyFilters: () => void
}

const EquipmentCatalogFilters = (props: IProps) => {
  return (
    <div className="filters">
      <h3>Фильтры</h3>

      <select value={props.filters.category} onChange={(e) => props.handleChange(e.target.value, 'category')}>
        <option value="all">Все категории</option>
        <option value="construction">Строительное оборудование</option>
        <option value="agriculture">Сельхозоборудование</option>
        <option value="transport">Транспорт</option>
      </select>

      <input
        type="range"
        min={100}
        max={10000}
        value={props.filters.price[1]}
        onChange={(e) => props.handleChange([100, +e.target.value], 'price')}
      />

      <button onClick={props.applyFilters}>Применить фильтры</button>
    </div>
  )
}

export default EquipmentCatalogFilters
