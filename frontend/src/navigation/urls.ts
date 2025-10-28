import { IEquipmentLot } from '@/pages/EquipmentLot/equipmentLot.types'

const urls = {
  auth: '/auth',
  home: '/',
  main: '/main',
  equipmentLots: '/equipmentLots',
  equipmentLot: '/equipmentLot',
  personalAccount: '/personalAccount',
  equipmentLotScreen: (id: IEquipmentLot['id']) => `/equipmentLot/${id}`,
}

export default urls
