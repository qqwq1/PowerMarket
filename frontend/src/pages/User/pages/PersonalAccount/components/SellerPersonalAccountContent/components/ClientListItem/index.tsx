import { IRentalRequest } from '@/pages/Rental/rental.types'
import timeUtils from '@/styles/time.utils'
import useRespondRentalRequest from './useRespondRentalRequest'
import Button from '@/shared/Buttons/Button'

interface IProps {
  rentalRequest: IRentalRequest
}

const ClientListItem = (props: IProps) => {
  const ctrl = useRespondRentalRequest(props.rentalRequest.id)

  return (
    <div className="flex-space-between">
      <div className="flex-lines">
        <p className="text-heading-5">{props.rentalRequest.tenantName}</p>
        <p className="text-sm text-secondary-strong">{`Дата создания: ${timeUtils.formatDate(
          props.rentalRequest.createdAt,
          'dd.MM.yyyy'
        )}`}</p>
      </div>

      <div className="inline-flex-gap gap12">
        <Button size="small" type="default" text="Отклонить" onClick={ctrl.rejectRentalRequest} />
        <Button size="small" type="primary" text="Принять" onClick={ctrl.approveRentalRequest} />
      </div>
    </div>
  )
}
export default ClientListItem
