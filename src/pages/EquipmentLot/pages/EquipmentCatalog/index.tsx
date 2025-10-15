import MainLayout from '@/shared/Layouts/MainLayout'
import { useRecoilState, useRecoilValue } from 'recoil'
import equipmentLotAtom from '../../equipmentLot.atom'
import EquipmentLotCard from './components/EquipmentLotCard'
import EquipmentCatalogFilters from './components/EquipmentCatalogFilters'
import equipmentLotFiltersAtom, { IEquipmentLotFiltersState } from '../../equipmentLotFilters.atom'
import css from './equipmentCatalog.module.css'
import cn from '@/utils/cn'

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
      <div className="height100" style={{ padding: '24px', flex: 1 }}>
        <div className="flex-lines gap16 height100">
          <h1 className="text-heading-3" style={{ margin: 0 }}>
            Доступное оборудование
          </h1>
          <div className={css.content}>
            <aside className="filters">
              <EquipmentCatalogFilters
                filters={filtersState}
                handleChange={handleFilterChange}
                applyFilters={() => {}}
              />
            </aside>
            <div className={css.resizer}></div>
            <div className={css.catalog}>
              {equipment.map((item) => (
                <EquipmentLotCard key={item.id} equipmentLot={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default EquipmentCatalog
