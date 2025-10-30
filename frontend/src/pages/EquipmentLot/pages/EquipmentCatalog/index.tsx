import MainLayout from '@/shared/Layouts/MainLayout'
import { useRecoilState, useRecoilValue } from 'recoil'
import equipmentLotAtom from '../../equipmentLot.atom'
import EquipmentLotCard from './components/EquipmentLotCard'
import EquipmentCatalogFilters from './components/EquipmentCatalogFilters'
import equipmentLotFiltersAtom, { IEquipmentLotFiltersState } from '../../equipmentLotFilters.atom'
import css from './equipmentCatalog.module.css'
import { useNavigate } from 'react-router-dom'
import urls from '@/navigation/urls'
import { useMemo } from 'react'

const EquipmentCatalog = () => {
  const equipment = useRecoilValue(equipmentLotAtom).items
  const [filtersState, setFiltersState] = useRecoilState(equipmentLotFiltersAtom)
  const navigate = useNavigate()

  const handleFilterChange = <T extends keyof IEquipmentLotFiltersState>(
    value: IEquipmentLotFiltersState[T],
    key: T
  ) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }))
  }

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      if (filtersState.category && item.category !== filtersState.category) {
        return false
      }

      const [minPrice, maxPrice] = filtersState.price
      if (minPrice != null && item.price < minPrice) {
        return false
      }
      if (maxPrice != null && item.price > maxPrice) {
        return false
      }

      return true
    })
  }, [equipment, filtersState])

  return (
    <MainLayout>
      <div className="height100" style={{ padding: '24px', flex: 1 }}>
        <div className="flex-lines gap16 height100">
          <div>
            <h1 className="text-heading-3" style={{ margin: 0 }}>
              Доступное оборудование
            </h1>
          </div>
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
              {filteredEquipment.map((item) => (
                <EquipmentLotCard
                  key={item.id}
                  equipmentLot={item}
                  onClick={(id) => navigate(urls.equipmentLotScreen(id))}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default EquipmentCatalog
