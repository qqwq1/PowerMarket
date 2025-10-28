import { useRecoilValue } from 'recoil'
import equipmentLotAtom from '@/pages/EquipmentLot/equipmentLot.atom'
import EquipmentLotCard from '@/pages/EquipmentLot/pages/EquipmentCatalog/components/EquipmentLotCard'
import urls from '@/navigation/urls'
import css from './sellerPersonalAccountContent.module.css'
import { useState } from 'react'
import EquipmentLotCreate from '@/pages/EquipmentLot/pages/EquipmentLotCreate'
import { useNavigate } from 'react-router-dom'
import userAtom from '@/pages/User/user.atom'
import Button from '@/shared/Buttons/Button'

const SellerPersonalAccountContent = () => {
  const { userRole } = useRecoilValue(userAtom)
  const equipmentLots = useRecoilValue(equipmentLotAtom).items
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  // Пока нет поля createdBy, показываем все лоты seller'у
  const myLots = userRole === 'seller' ? equipmentLots : []

  return (
    <>
      <Button size={'default'} type="primary" onClick={() => setCreateOpen(true)} text="Создать лот" />
      <div className={css.content}>
        <h2 className="text-heading-4">Мои лоты</h2>
        {myLots.length === 0 ? (
          <p>У вас пока нет лотов.</p>
        ) : (
          <div className={css.catalog}>
            {myLots.map((lot) => (
              <EquipmentLotCard
                key={lot.id}
                equipmentLot={lot}
                onClick={(id) => navigate(urls.equipmentLotScreen(id))}
              />
            ))}
          </div>
        )}
      </div>
      <EquipmentLotCreate open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  )
}

export default SellerPersonalAccountContent
