import Button from '@/shared/Buttons/Button'
import SeparateLine from '@/shared/SeparateLine'
import SidePage from '@/shared/SidePage'
import { useSetRecoilState } from 'recoil'
import rentalRequestAtom from '../../rentalRequest.atom'
import useStateWithChange from '@/shared/hooks/useStateWithChange'
import { IEquipmentLot } from '@/pages/EquipmentLot/equipmentLot.types'
import rentalUtils from '../../rental.utils'
import RentalRequestFormFields from '../RentalRequestFormFields'
import useHttpLoader from '@/shared/hooks/useHttpLoader'
import rentalApi from '../../rental.api'
import timeUtils from '@/utils/time.utils'
import { useMemo, useState } from 'react'
import formatUtils from '@/utils/format.utils'

interface IProps {
  open: boolean
  onClose: () => void
  equipmentLot: IEquipmentLot
}

const CreateRentalRequestSidePage = (props: IProps) => {
  const setRentalRequests = useSetRecoilState(rentalRequestAtom)
  const [state, _, handleChange] = useStateWithChange(rentalUtils.generateCreateRentalDTO(props.equipmentLot.id))
  const { wait } = useHttpLoader()
  const [error, setError] = useState('')

  const handleCreate = () => {
    wait(rentalApi.createRentalRequest(state), (resp) => {
      if (resp.status === 'success') {
        setRentalRequests((prev) => ({ ...prev, items: [...prev.items, resp.body] }))
      } else {
        setError(resp?.body?.message || resp.message)
      }
    })
  }

  const calculatorValues = useMemo(() => {
    const { pricePerDay } = props.equipmentLot
    const days = timeUtils.differenceInCalendarDays(state.endDate, state.startDate)
    if (!pricePerDay || !Boolean(days) || days <= 0 || state.capacityNeeded <= 0) return null
    return {
      pricePerDay,
      days,
      capacityNeeded: state.capacityNeeded,
      result: pricePerDay * days * state.capacityNeeded,
    }
  }, [state, props.equipmentLot])

  return (
    <SidePage onClose={props.onClose} open={props.open}>
      <div className="flex-lines gap16" style={{ height: '100%' }}>
        <h4 className="text-heading-4">Заявка на аренду</h4>
        <SeparateLine />
        {state && <RentalRequestFormFields rentalRequest={state} onChange={handleChange} />}
        <SeparateLine />
        {calculatorValues && (
          <>
            <div>
              <p className="text-nm text-secondary">
                {'Количество дней: '}
                <span className="text-nm">{calculatorValues.days}</span>
              </p>
              <p className="text-nm text-secondary">
                {'Цена за день: '}
                <span className="text-nm">{formatUtils.formatNumber(calculatorValues.pricePerDay)} ₽</span>
              </p>
              <p className="text-nm text-secondary">
                {'Мощность: '}
                <span className="text-nm">{calculatorValues.capacityNeeded}</span>
              </p>
              <p className="text-heading-5">
                {'Итого: '}
                <span className="text-nm">{formatUtils.formatNumber(calculatorValues.result)} ₽</span>
              </p>
            </div>
            <SeparateLine />
          </>
        )}
        <div className="flex-lines gap8" style={{ marginTop: 'auto' }}>
          <p className="text-nm text-error">{error}</p>
          <SeparateLine />
        </div>
        <div className="inline-flex-gap gap8">
          <Button size="default" type="primary" text="Добавить" onClick={handleCreate} disabled={!calculatorValues} />
          <Button size="default" type="default" text="Отменить" onClick={props.onClose} />
        </div>
      </div>
    </SidePage>
  )
}

export default CreateRentalRequestSidePage
