import { IOption } from '@/types/global'
import { TEquipmentLotCategory } from '../../equipmentLot.types'

const categoryOptions: IOption<TEquipmentLotCategory>[] = [
  { title: 'Производство', value: 'MANUFACTURING' },
  { title: 'Оборудование', value: 'EQUIPMENT' },
  { title: 'Складские помещения', value: 'WAREHOUSE' },
  { title: 'Транспорт', value: 'TRANSPORT' },
  { title: 'Лабораторные услуги', value: 'LABORATORY' },
  { title: 'Обработка', value: 'PROCESSING' },
  { title: 'Сборка', value: 'ASSEMBLY' },
  { title: 'Тестирование', value: 'TESTING' },
  { title: 'Другое', value: 'OTHER' },
]

const statusOptions = [
  { title: 'Активен', value: 'active' },
  { title: 'На модерации', value: 'moderation' },
  { title: 'Приостановлен', value: 'paused' },
]

const equipmentLotCreateConstants = { statusOptions, categoryOptions }

export default equipmentLotCreateConstants
