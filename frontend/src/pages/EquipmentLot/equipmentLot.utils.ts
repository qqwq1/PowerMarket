import { TEquipmentLotDto } from './equipmentLot.types'

const generateEmptyEquipmentLot = (): TEquipmentLotDto => ({
  title: '',
  description: '',
  category: null,
  pricePerDay: 0,
  location: '',
  capacity: '',
  availableCapacity: '',
  technicalSpecs: '',
  availabilities: [],
})

const equipmentLotUtils = { generateEmptyEquipmentLot }

export default equipmentLotUtils
