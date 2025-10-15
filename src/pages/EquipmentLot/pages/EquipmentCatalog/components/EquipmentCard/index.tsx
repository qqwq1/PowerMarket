import { IEquipmentLot } from '@/pages/EquipmentLot/equipmentLot.types'

interface IProps {
  equipmentLot: IEquipmentLot
}

const EquipmentCard = (props: IProps) => {
  return (
    <div className="equipment-card">
      <img src={props.equipmentLot.images[0]} alt="Нет изображения" />
      <div className="equipment-card__info">
        <h4>{props.equipmentLot.title}</h4>
        <p>{props.equipmentLot.price} ₽/день</p>
      </div>
    </div>
  )
}

export default EquipmentCard
