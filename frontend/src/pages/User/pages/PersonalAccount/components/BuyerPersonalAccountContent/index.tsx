import { useRecoilValue } from 'recoil'
import equipmentLotAtom from '@/pages/EquipmentLot/equipmentLot.atom'
import EquipmentLotCard from '@/pages/EquipmentLot/pages/EquipmentCatalog/components/EquipmentLotCard'
import urls from '@/navigation/urls'
import css from './buyerPersonalAccountContent.module.css'
import { useState } from 'react'
import EquipmentLotCreate from '@/pages/EquipmentLot/pages/EquipmentLotCreate'
import { useNavigate } from 'react-router-dom'
import userAtom from '@/pages/User/user.atom'
import Button from '@/shared/Buttons/Button'
import LotRequestsCard from '../SellerPersonalAccountContent/components/LotRequestsCard'
import SearchInput from '@/shared/Inputs/SearchInput'

const BuyerPersonalAccountContent = () => {
  const { userRole } = useRecoilValue(userAtom)
  const equipmentLots = useRecoilValue(equipmentLotAtom).items
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  // Пока нет поля createdBy, показываем все лоты seller'у
  const myLots = userRole === 'seller' ? equipmentLots : []

  return (
    <>
      <div className={css.content}>
        <SearchInput value={''} name={''} onChange={() => {}} />
        {myLots.length === 0 ? (
          <p>У вас пока нет лотов.</p>
        ) : (
          <div className={css.catalog}>
            {myLots.map((lot) => (
              <LotRequestsCard key={lot.id} lot={lot} />
            ))}
          </div>
        )}
      </div>
      <EquipmentLotCreate open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  )
}

export default BuyerPersonalAccountContent
