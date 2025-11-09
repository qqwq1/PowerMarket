import MainLayout from '@/shared/Layouts/MainLayout'
import css from './equipmentLotPage.module.css'
import { useParams } from 'react-router-dom'
import useEquipmentLot from '../../hooks/useEquipmentLot'
import Button from '@/shared/Buttons/Button'
import PlusIcon from '@/assets/icons/plus.svg?react'
import { useRecoilValue } from 'recoil'
import userAtom from '@/pages/User/user.atom'
import { useState } from 'react'
import PlaceholderIcon from '@/assets/images/imageCardPlaceholder.svg?react'
import CreateRentalRequestSidePage from '@/pages/Rental/components/CreateRentalRequestSidePage'

const EquipmentLotPage = () => {
  const [createRentalOpen, setCreateRentalOpen] = useState(false)
  const userState = useRecoilValue(userAtom)
  const equipmentId = useParams().id

  const equipmentLot = useEquipmentLot(equipmentId)

  return (
    <>
      <MainLayout>
        <div className="height100" style={{ padding: '24px', flex: 1 }}>
          <div className="flex-lines gap16 height100">
            <div className="flex-space-between">
              <h1 className="text-heading-3" style={{ margin: 0 }}>
                {equipmentLot.title}
              </h1>
              {userState.user.role === 'TENANT' && (
                <Button
                  icon={<PlusIcon />}
                  text="Предложить сотрудничество"
                  size="default"
                  type="default"
                  onClick={() => setCreateRentalOpen(true)}
                />
              )}
            </div>
            <div className={css.content}>
              <PlaceholderIcon style={{ height: '440px', margin: '0 auto' }} />
              {/* <img src={equipmentLot.images[0]} style={{ height: '580px' }} alt="" /> */}
              <div className="flex-lines gap16 width100">
                <p className="text-heading-4">Описание</p>
                <p className="text-sm">{equipmentLot.description}</p>
                <p className="text-nm text-secondary">
                  {'Поставщик: '}
                  <span className="text-sm">{equipmentLot.supplierName || '-'}</span>
                </p>
                <p className="text-nm text-secondary">
                  {'Локация: '}
                  <span className="text-sm">{equipmentLot.location || '-'}</span>
                </p>
                <p className="text-nm text-secondary">
                  {'Технические характеристики: '}
                  <span className="text-sm">{equipmentLot.technicalSpecs || '-'}</span>
                </p>
                <p className="text-nm text-secondary">
                  {'Цена за день: '}
                  <span className="text-sm">{equipmentLot.pricePerDay ? `${equipmentLot.pricePerDay} ₽` : '-'}</span>
                </p>
                <div className="inline-flex-gap gap16">
                  <p className="text-nm text-secondary">
                    {'Общее(-ая) количество / мощность: '}{' '}
                    <span className="text-sm text-success">{equipmentLot.availableCapacity}</span>
                  </p>
                  <p className="text-nm text-secondary">
                    {'Доступно: '} <span className="text-sm">{equipmentLot.totalCapacity}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
      {equipmentLot && (
        <CreateRentalRequestSidePage
          open={createRentalOpen}
          onClose={() => setCreateRentalOpen(false)}
          equipmentLot={equipmentLot}
        />
      )}
    </>
  )
}

export default EquipmentLotPage
