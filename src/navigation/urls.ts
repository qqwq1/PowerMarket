import { IEquipmentLot } from '@/pages/EquipmentLot/equipmentLot.types'

const urls = {
  auth: '/auth',
  home: '/',
  main: '/main',
  catalog: '/catalog',
  equipmentLot: '/equipmentLot',
  equipmentLotScreen: (id: IEquipmentLot['id']) => `/equipmentLot/${id}`,
}

export default urls
