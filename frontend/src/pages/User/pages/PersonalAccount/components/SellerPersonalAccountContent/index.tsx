import { useRecoilValue } from 'recoil'
import css from './sellerPersonalAccountContent.module.css'
import equipmentLotAtom from '@/pages/EquipmentLot/equipmentLot.atom'
import EquipmentLotCreate from '@/pages/EquipmentLot/pages/EquipmentLotCreate'

import { useMemo, useState } from 'react'
import Button from '@/shared/Buttons/Button'
import SearchInput from '@/shared/Inputs/SearchInput'
import LotRequestsCard from './components/LotRequestsCard'

const SellerPersonalAccountContent = () => {
  const equipmentLots = useRecoilValue(equipmentLotAtom).items
  const [filters, setFilters] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  // Пока нет поля createdBy, показываем все лоты seller'у
  const filteredLots = useMemo(() => {
    const search = filters.trim().toLowerCase()
    if (!search) return equipmentLots
    return equipmentLots.filter((item) => item.title.toLowerCase().includes(search))
  }, [filters, equipmentLots])

  const renderContent = () => {
    if (filteredLots.length === 0) return <p>Лоты не найдены.</p>
    return (
      <div className={css.catalog}>
        {filteredLots.map((lot) => (
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
              value={filters}
              name={'lotTitle'}
              onChange={setFilters}
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
