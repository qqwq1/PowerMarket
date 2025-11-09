import { IEquipmentLot } from '../EquipmentLot/equipmentLot.types'
import { IRentalRequestCreateDto } from './rental.types'

const generateCreateRentalDTO = (lotId: IEquipmentLot['id']): IRentalRequestCreateDto => {
  return {
    serviceId: lotId,
    startDate: '',
    endDate: '',
    capacityNeeded: 1,
  }
}

const rentalUtils = { generateCreateRentalDTO }
export default rentalUtils
