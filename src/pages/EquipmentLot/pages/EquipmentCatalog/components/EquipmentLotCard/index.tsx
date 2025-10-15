import { IEquipmentLot } from '@/pages/EquipmentLot/equipmentLot.types'
import css from './equipmentLotCard.module.css'

interface IProps {
  equipmentLot: IEquipmentLot
}

const EquipmentLotCard = (props: IProps) => {
  return (
    <div className={css.card}>
      <img src={props.equipmentLot.images[0]} alt={props.equipmentLot.title} className={css.img} />
      <div className={css.info}>
        <h4>{props.equipmentLot.title}</h4>
        <p className={css.price}>{props.equipmentLot.price}</p>
        <p className={css.location}>{props.equipmentLot.location}</p>
      </div>
    </div>
  )
}

export default EquipmentLotCard
