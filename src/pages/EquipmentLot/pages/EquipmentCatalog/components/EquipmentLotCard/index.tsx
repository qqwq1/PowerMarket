import { IEquipmentLot } from '@/pages/EquipmentLot/equipmentLot.types'
import css from './equipmentLotCard.module.css'

interface IProps {
  equipmentLot: IEquipmentLot
  onClick: (id: IEquipmentLot['id']) => void
}

const EquipmentLotCard = (props: IProps) => {
  return (
    <div key={props.equipmentLot.id} onClick={() => props.onClick(props.equipmentLot.id)} className={css.card}>
      <img src={props.equipmentLot.images[0]} alt={props.equipmentLot.title} className={css.img} />
      <div className={css.info}>
        <h4>{props.equipmentLot.title}</h4>
        <p className={css.price}>{props.equipmentLot.price}₽/час</p>
        <p className={css.location}>{props.equipmentLot.location}</p>
      </div>
    </div>
  )
}

export default EquipmentLotCard
