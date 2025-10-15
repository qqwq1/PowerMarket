import MainLayout from '@/shared/Layouts/MainLayout'
import { useRecoilState, useRecoilValue } from 'recoil'
import equipmentLotAtom from '../../equipmentLot.atom'
import EquipmentCard from './components/EquipmentCard'
import EquipmentCatalogFilters from './components/EquipmentCatalogFilters'
import equipmentLotFiltersAtom, { IEquipmentLotFiltersState } from '../../equipmentLotFilters.atom'

const EquipmentCatalog = () => {
  const equipment = useRecoilValue(equipmentLotAtom).items
  const [filtersState, setFiltersState] = useRecoilState(equipmentLotFiltersAtom)

  const handleFilterChange = <T extends keyof IEquipmentLotFiltersState>(
    value: IEquipmentLotFiltersState[T],
    key: T
  ) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <MainLayout>
      <div className="flex-lines gap16 height100 width100" style={{ padding: '24px', paddingBottom: 0 }}>
        <h1 className="text-heading-3" style={{ margin: 0 }}>
          Доступное оборудование
        </h1>
        <aside className="filters">
          <EquipmentCatalogFilters filters={filtersState} handleChange={handleFilterChange} applyFilters={() => {}} />
        </aside>
        <main className="equipment-list">
          {equipment.map((item) => (
            <EquipmentCard key={item.id} equipmentLot={item} />
          ))}
        </main>
      </div>
    </MainLayout>
  )
}

export default EquipmentCatalog
