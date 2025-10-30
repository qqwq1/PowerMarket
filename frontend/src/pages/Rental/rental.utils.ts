import { IEquipmentLot } from '../EquipmentLot/equipmentLot.types'
import { IRentalDTO } from './rental.types'

const generateCreateRentalDTO = (lotId: IEquipmentLot['id']): IRentalDTO => {
  return {
    serviceId: +lotId,
    startDate: new Date().toUTCString(),
    endDate: new Date().toUTCString(),
    message: '',
  }
}

const rentalUtils = { generateCreateRentalDTO }
export default rentalUtils
