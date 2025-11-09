import FormField from '@/shared/Forms/FormField'
import AntDateRangePicker from '@/shared/Forms/DatePickers/AntDateRangePicker'
import { IRentalRequestCreateDto } from '../../rental.types'
import TextInput from '@/shared/Inputs/TextInput'
import timeUtils from '@/utils/time.utils'

interface IProps {
  rentalRequest: IRentalRequestCreateDto
  onChange: (val: any, name: string) => void
}

const RentalRequestFormFields = (props: IProps) => {
  // Обработчик для AntDateRangePicker: получает startTs/endTs (ms)
  const handleRangeChange = (startTs: number, endTs: number) => {
    const startDate = startTs ? timeUtils.formatDate(startTs, 'yyyy-MM-dd') : ''
    const endDate = endTs ? timeUtils.formatDate(endTs, 'yyyy-MM-dd') : ''
    props.onChange(startDate, 'startDate')
    props.onChange(endDate, 'endDate')
  }

  return (
    <>
      <FormField label="Требуемая мощность" style={{ width: '100%' }} required>
        <TextInput
          type="number"
          value={props.rentalRequest.capacityNeeded.toString()}
          name="capacityNeeded"
          onChange={props.onChange}
          placeHolder="Требуемая мощность/количество"
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
