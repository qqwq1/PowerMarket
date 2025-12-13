export const ALL_CATEGORY_VALUE = 'all'

export const CATEGORIES = ['MANUFACTURING', 'LOGISTICS', 'STORAGE', 'PROCESSING', 'ASSEMBLY', 'PACKAGING', 'OTHER']

export const CATEGORY_LABELS: Record<string, string> = {
  MANUFACTURING: 'Производство',
  LOGISTICS: 'Логистика',
  STORAGE: 'Складирование',
  PROCESSING: 'Обработка',
  ASSEMBLY: 'Сборка',
  PACKAGING: 'Упаковка',
  OTHER: 'Другое',
}

export const testLoginData = {
  SUPPLIER: {
    email: 'supplier@mail.ru',
    password: 'admin1970',
  },
  TENANT: {
    email: 'tenant@mail.ru',
    password: 'admin1970',
  },
}

export const STATUS_COLORS: Record<string, string> = {
  AWAITING_ACCEPTANCE: '#6B7280', // серый
  ACCEPTED: '#2563EB', // синий
  IN_PROGRESS: '#F59E42', // оранжевый
  COMPLETED: '#22C55E', // зелёный
  CANCELLED: '#EF4444', // красный
}
export const STATUS_LABELS: Record<string, string> = {
  AWAITING_ACCEPTANCE: 'Не принят',
  ACCEPTED: 'Принят',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Выполнен',
  CANCELLED: 'Отменён',
}

export const statusLabels: Record<string, string> = {
  PENDING: 'Ожидает ответа',
  IN_CONTRACT: 'В договоре',
  CONFIRMED: 'Подтверждено',
  IN_RENT: 'В аренде',
  COMPLETED: 'Завершено',
  REJECTED: 'Отклонено',
  CANCELLED: 'Отменено',
}

export const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_CONTRACT: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  IN_RENT: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}
