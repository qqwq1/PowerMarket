import { atom } from 'recoil'
import { IEquipmentLot } from './equipmentLot.types'

export interface IEquipmentLotState {
  items: IEquipmentLot[]
  loaded: boolean
}

const equipmentLotAtom = atom<IEquipmentLotState>({
  key: 'equipmentLots',
  default: {
    items: [
      {
        id: '1',
        title: '3D-принтер Anycubic Photon M3',
        description:
          'Высокоточный 3D-принтер для печати моделей и прототипов. Подходит для мелкосерийного производства.',
        category: '3d-print',
        price: '1200 ₽/час',
        location: 'Москва',
        images: ['https://16k20.ru/img/cat/c6163_01.jpg'],
        status: 'active',
        createdAt: '2025-09-15T10:24:00Z',
      },
      {
        id: '2',
        title: 'Фрезерный станок Haas VF-2',
        description: 'Современный ЧПУ станок для металлообработки. Возможна аренда с оператором.',
        category: 'metalworking',
        price: '2500 ₽/час',
        location: 'Екатеринбург',
        images: ['https://16k20.ru/img/cat/c6163_01.jpg'],
        status: 'active',
        createdAt: '2025-09-10T08:10:00Z',
      },
      {
        id: '3',
        title: 'Токарный станок ИЖ250',
        description: 'Подходит для обработки мелких деталей. Идеален для учебных или ремонтных работ.',
        category: 'metalworking',
        price: '1000 ₽/час',
        location: 'Казань',
        images: ['https://16k20.ru/img/cat/c6163_01.jpg'],
        status: 'paused',
        createdAt: '2025-08-28T14:40:00Z',
      },
      {
        id: '4',
        title: 'Промышленный 3D-принтер Creality CR-30',
        description: 'Ленточный принтер с непрерывной печатью. Можно использовать для серийных заказов.',
        category: '3d-print',
        price: '1800 ₽/час',
        location: 'Санкт-Петербург',
        images: ['https://16k20.ru/img/cat/c6163_01.jpg'],
        status: 'active',
        createdAt: '2025-09-22T11:55:00Z',
      },
      {
        id: '5',
        title: 'Лазерный гравер Raylogic 11G',
        description: 'Гравировка по дереву, пластику и металлу. Высокая точность и чистота линий.',
        category: 'metalworking',
        price: '1500 ₽/час',
        location: 'Новосибирск',
        images: ['https://16k20.ru/img/cat/c6163_01.jpg'],
        status: 'moderation',
        createdAt: '2025-09-05T09:15:00Z',
      },
    ],
    loaded: false,
  },
})
export default equipmentLotAtom
