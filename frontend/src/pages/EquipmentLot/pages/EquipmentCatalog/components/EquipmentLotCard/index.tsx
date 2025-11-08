import { IEquipmentLot } from '@/pages/EquipmentLot/equipmentLot.types'
import css from './equipmentLotCard.module.css'
import PlaceholderIcon from '@/assets/images/imageCardPlaceholder.svg?react'

interface IProps {
  equipmentLot: IEquipmentLot
  onClick: (id: IEquipmentLot['id']) => void
}

const EquipmentLotCard = (props: IProps) => {
  return (
    <div key={props.equipmentLot.id} onClick={() => props.onClick(props.equipmentLot.id)} className={css.card}>
      <PlaceholderIcon className={css.img} />
      <div className={css.info}>
        <h4>{props.equipmentLot.title}</h4>
        <p className={css.price}>{props.equipmentLot.pricePerDay}₽/час</p>
        <p className={css.location}>{props.equipmentLot.location}</p>
      </div>
    </div>
  )
}

export default EquipmentLotCard
