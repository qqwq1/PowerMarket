import MainLayout from '@/shared/Layouts/MainLayout'
import EquipmentLotCard from './components/EquipmentLotCard'
import EquipmentCatalogFilters from './components/EquipmentCatalogFilters'
import css from './equipmentCatalog.module.css'
import { useNavigate } from 'react-router-dom'
import urls from '@/navigation/urls'
import useEquipmentCatalog from './useEquipmentCatalog'

const EquipmentCatalog = () => {
  const ctrl = useEquipmentCatalog()
  const navigate = useNavigate()

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
              <EquipmentCatalogFilters filters={ctrl.filtersState} handleChange={ctrl.handleFilterChange} />
            </aside>
            <div className={css.resizer}></div>
            <div className={css.catalog}>
              {ctrl.equipmentLots.map((item) => (
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
