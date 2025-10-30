import FormField from '@/shared/Forms/FormField'
import { IRentalDTO } from '../../rental.types'
import TextInput from '@/shared/Inputs/TextInput'
import { DatePicker } from 'antd'
import dayjs from 'dayjs'

interface IProps {
  rentalRequest: IRentalDTO
  onChange: (val: any, name: string) => void
}

const RentalRequestFormFields = (props: IProps) => {
  const { RangePicker } = DatePicker
  const dateFormat = 'YYYY/MM/DD'
  const handleRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      props.onChange(dates[0]?.toISOString() ?? '', 'startDate')
      props.onChange(dates[1]?.toISOString() ?? '', 'endDate')
    }
  }

  return (
    <>
      <FormField label="Комментарий" style={{ width: '100%' }}>
        <TextInput
          value={props.rentalRequest.message ?? ''}
          name="message"
          type="area"
          onChange={props.onChange}
          placeHolder="Комментарий к заявке (опционально)"
        />
      </FormField>
      <RangePicker
        value={[
          props.rentalRequest.startDate ? dayjs(props.rentalRequest.startDate) : null,
          props.rentalRequest.endDate ? dayjs(props.rentalRequest.endDate) : null,
        ]}
        format={dateFormat}
        onChange={handleRangeChange}
      />
    </>
  )
}

export default RentalRequestFormFields
