import { format } from 'date-fns/format'
import { ru } from 'date-fns/locale/ru'

export const formatDate = (date: Date | number | string, str: string) => {
  if (!date) return null
  let normalizedDate: Date = null

  if (typeof date === 'object') normalizedDate = date
  try {
    normalizedDate = new Date(date)
  } catch (err) {
    console.log(err)
    return null
  }

  try {
    return format(normalizedDate, str, { locale: ru })
  } catch {
    console.log('err')
    return null
  }
}

const timeUtils = {
  formatDate,
}

export default timeUtils
