import FormField from '@/shared/Forms/FormField'
import { IRentalDTO } from '../../rental.types'

import TextArea from '@/shared/Inputs/TextArea'
import AntDateRangePicker from '@/shared/Forms/DatePickers/AntDateRangePicker'

interface IProps {
  rentalRequest: IRentalDTO
  onChange: (val: any, name: string) => void
}

const RentalRequestFormFields = (props: IProps) => {
  // Обработчик для AntDateRangePicker: получает startTs/endTs (ms)
  const handleRangeChange = (startTs: number, endTs: number) => {
    props.onChange(startTs ? new Date(startTs).toISOString() : '', 'startDate')
    props.onChange(endTs ? new Date(endTs).toISOString() : '', 'endDate')
  }

  return (
    <>
      <FormField label="Комментарий" style={{ width: '100%' }}>
        <TextArea
          value={props.rentalRequest.message ?? ''}
          name="message"
          onChange={props.onChange}
          placeHolder="Комментарий к заявке (опционально)"
        />
      </FormField>
      <AntDateRangePicker
        onChange={handleRangeChange}
        allowSelectInFuture
        startTs={props.rentalRequest.startDate ? Date.parse(props.rentalRequest.startDate) : null}
        endTs={props.rentalRequest.endDate ? Date.parse(props.rentalRequest.endDate) : null}
      />
    </>
  )
}

export default RentalRequestFormFields
