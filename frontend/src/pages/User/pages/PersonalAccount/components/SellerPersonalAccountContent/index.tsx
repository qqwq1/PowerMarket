import css from './sellerPersonalAccountContent.module.css'
import EquipmentLotCreate from '@/pages/EquipmentLot/pages/EquipmentLotCreate'

import { useState } from 'react'
import Button from '@/shared/Buttons/Button'
import SearchInput from '@/shared/Inputs/SearchInput'
import LotRequestsCard from './components/LotRequestsCard'
import useSellerPersonalAccount from './useSellerPersonalAccount'

const SellerPersonalAccountContent = () => {
  const ctrl = useSellerPersonalAccount()

  const [createOpen, setCreateOpen] = useState(false)

  const renderContent = () => {
    if (ctrl.selfEquipmentLots.length === 0) return <p>Лоты не найдены.</p>
    return (
      <div className={css.catalog}>
        {ctrl.selfEquipmentLots.map((lot) => (
          <LotRequestsCard key={lot.id} lot={lot} />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className={css.content}>
        <div style={{ paddingRight: '24px' }}>
          <div className="inline-flex-gap width100">
            <SearchInput
              placeHolder="Введите название лота или его ID"
              value={ctrl.filters}
              name={'lotTitle'}
              onChange={ctrl.onFiltersChange}
            />
            <Button size={'default'} type="primary" onClick={() => setCreateOpen(true)} text="Создать лот" />
          </div>
        </div>
        {renderContent()}
      </div>
      <EquipmentLotCreate open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  )
}

export default SellerPersonalAccountContent
