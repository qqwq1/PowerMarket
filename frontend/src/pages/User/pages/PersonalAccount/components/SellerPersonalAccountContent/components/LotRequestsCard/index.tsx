import { IEquipmentLot } from '@/pages/EquipmentLot/equipmentLot.types'
import css from './lotRequestsCard.module.css'
import Button from '@/shared/Buttons/Button'
import ArrowDown from '@/assets/icons/arrowDown.svg?react'
import { useState } from 'react'
import SeparateLine from '@/shared/SeparateLine'
import ClientListItem from '../ClientListItem'
import { IRentalRequest } from '@/pages/Rental/rental.types'

interface IProps {
  lot: IEquipmentLot
}

export const mockRentalRequests: IRentalRequest[] = [
  {
    id: 1,
    serviceId: 101,
    serviceTitle: '3D-принтер Anycubic Photon M3',
    tenantId: 201,
    tenantName: 'Иван Иванов',
    supplierId: 301,
    startDate: '2025-11-01T10:00:00Z',
    endDate: '2025-11-03T18:00:00Z',
    message: 'Нужен для прототипирования',
    totalPrice: 3600,
    status: 'PENDING',
    createdAt: '2025-10-30T09:00:00Z',
  },
  {
    id: 2,
    serviceId: 102,
    serviceTitle: 'Фрезерный станок Haas VF-2',
    tenantId: 202,
    tenantName: 'Петр Петров',
    supplierId: 302,
    startDate: '2025-11-05T09:00:00Z',
    endDate: '2025-11-07T17:00:00Z',
    message: 'Для учебных работ',
    totalPrice: 5000,
    status: 'APPROVED',
    createdAt: '2025-10-29T14:30:00Z',
  },
  {
    id: 3,
    serviceId: 103,
    serviceTitle: 'Лазерный гравер Raylogic 11G',
    tenantId: 203,
    tenantName: 'Сидор Сидоров',
    supplierId: 303,
    startDate: '2025-11-10T12:00:00Z',
    endDate: '2025-11-12T16:00:00Z',
    message: 'Гравировка по дереву',
    totalPrice: 4200,
    status: 'REJECTED',
    createdAt: '2025-10-28T11:15:00Z',
  },
]

const LotRequestsCard = (props: IProps) => {
  const [collapsed, setCollapsed] = useState(true)
  const [rentalRequests, setRentalRequests] = useState(mockRentalRequests)

  const renderClientList = () => {
    return (
      <div className="flex-lines gap16">
        {rentalRequests.map((item) => (
          <ClientListItem rentalRequest={item} />
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
        <img src={props.lot.images[0]} alt={props.lot.title} className={css.img} />
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
