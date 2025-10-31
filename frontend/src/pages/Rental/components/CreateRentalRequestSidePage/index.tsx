import Button from '@/shared/Buttons/Button'
import SeparateLine from '@/shared/SeparateLine'
import SidePage from '@/shared/SidePage'
import { useRecoilState } from 'recoil'
import rentalRequestAtom from '../../rentalRequest.atom'
import useStateWithChange from '@/shared/hooks/useStateWithChange'
import { IEquipmentLot } from '@/pages/EquipmentLot/equipmentLot.types'
import rentalUtils from '../../rental.utils'
import RentalRequestFormFields from '../RentalRequestFormFields'

interface IProps {
  open: boolean
  onClose: () => void
  lotId: IEquipmentLot['id']
}

const CreateRentalRequestSidePage = (props: IProps) => {
  const [_rentalRequests, setRentalRequests] = useRecoilState(rentalRequestAtom)
  const [state, _, handleChange] = useStateWithChange(rentalUtils.generateCreateRentalDTO(props.lotId))

  const handleCreate = () => {
    const newRentalRequest = { id: new Date().getMilliseconds(), tenantId: 0, supplierId: 0, ...state }
    setRentalRequests((prev) => ({ ...prev, items: [newRentalRequest, ...prev.items] }))
  }

  return (
    <SidePage onClose={props.onClose} open={props.open}>
      <div className="flex-lines gap16" style={{ height: '100%' }}>
        <h4 className="text-heading-4">Добавление сотрудника</h4>
        <SeparateLine />
        bjfjkudfs89ugcf7ydr6
        <RentalRequestFormFields rentalRequest={state} onChange={handleChange} />
        <div style={{ marginTop: 'auto' }}>
          <SeparateLine />
        </div>
        <div className="inline-flex-gap gap8">
          <Button size="default" type="primary" text="Добавить" onClick={handleCreate} />
          <Button size="default" type="default" text="Отменить" onClick={props.onClose} />
        </div>
      </div>
    </SidePage>
  )
}

export default CreateRentalRequestSidePage
