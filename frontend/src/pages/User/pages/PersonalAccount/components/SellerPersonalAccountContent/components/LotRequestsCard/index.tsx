import { IEquipmentLot } from '@/pages/EquipmentLot/equipmentLot.types'
import css from './lotRequestsCard.module.css'
import Button from '@/shared/Buttons/Button'
import ArrowDown from '@/assets/icons/arrowDown.svg?react'
import { useState } from 'react'
import SeparateLine from '@/shared/SeparateLine'
import ClientListItem from '../ClientListItem'
import { IRentalRequest } from '@/pages/Rental/rental.types'
import ImagePlaceholder from '@/assets/images/imageCardPlaceholder.svg?react'

interface IProps {
  lot: IEquipmentLot
}

const LotRequestsCard = (props: IProps) => {
  const [collapsed, setCollapsed] = useState(true)
  const [rentalRequests, _] = useState(mockRentalRequests)

  const renderClientList = () => {
    return (
      <div className="flex-lines gap16">
        {rentalRequests.map((item) => (
          <ClientListItem key={item.id} rentalRequest={item} />
        ))}
      </div>
    )
  }

  return (
    <div className={css.wrapper} data-collapsed={collapsed}>
      <div className="flex-space-between height100">
        <div className="flex-lines height100" style={{ justifyContent: 'space-between' }}>
          <div className="flex-lines gap4">
            <h1>{props.lot.title}</h1>
            <p>{props.lot.description}</p>
          </div>
          <Button
            size="default"
            type="default"
            text={`${rentalRequests.length} новых запроса`}
            icon={<ArrowDown />}
            onClick={() => setCollapsed((prev) => !prev)}
          />
        </div>
        <ImagePlaceholder className={css.img} />
        {/* <img src={props.lot.images[0]} alt={props.lot.title} className={css.img} /> */}
      </div>
      <SeparateLine />
      {!collapsed && (
        <div className="flex-lines gap16">
          <p className="text-nm text-description">Запросы на аренду</p>
          {renderClientList()}
          <SeparateLine />
        </div>
      )}
    </div>
  )
}

export default LotRequestsCard
