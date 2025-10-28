const categoryOptions = [
  { title: 'Металлообработка', value: 'metalworking' },
  { title: '3D-печать', value: '3d-print' },
  { title: 'Станки с ЧПУ', value: 'cnc-machining' },
  { title: 'Лазерная резка', value: 'laser-cutting' },
  { title: 'Сварочное оборудование', value: 'welding' },
]

const statusOptions = [
  { title: 'Активен', value: 'active' },
  { title: 'На модерации', value: 'moderation' },
  { title: 'Приостановлен', value: 'paused' },
]

const equipmentLotCreateConstants = { statusOptions, categoryOptions }

export default equipmentLotCreateConstants
