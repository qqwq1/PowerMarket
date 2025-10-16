import MainLayout from '../../../../shared/Layouts/MainLayout'
import css from './equipmentLotPage.module.css'
import { useParams } from 'react-router-dom'
import useEquipmentLot from '../../hooks/useEquipmentLot'

const EquipmentLotPage = () => {
  const equipmentId = useParams().id

  const equipmentLot = useEquipmentLot(equipmentId)

  return (
    <MainLayout>
      <div className="height100" style={{ padding: '24px', flex: 1 }}>
        <div className="flex-lines gap16 height100">
          <h1 className="text-heading-3" style={{ margin: 0 }}>
            {equipmentLot.title}
          </h1>
          <div className={css.content}>
            <img src={equipmentLot.images[0]} style={{ height: '580px' }} alt="" />
            <div className="flex-lines gap16">
              <h6 className="text-heading-3">Описание</h6>
              <p className="text-sm">{equipmentLot.description}</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default EquipmentLotPage
