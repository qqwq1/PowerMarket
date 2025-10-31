import {
  eachDayOfInterval,
  endOfWeek,
  formatDistanceToNow,
  isToday,
  parseISO,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
  addWeeks,
  subMonths,
  subWeeks,
  isSameDay,
  intervalToDuration,
  addDays,
  subDays,
  isWithinInterval,
  isAfter,
  isBefore,
  differenceInCalendarDays,
  isFirstDayOfMonth,
  isLastDayOfMonth,
} from 'date-fns'
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

function timeAgo(dateString: string): string {
  const date = parseISO(dateString)
  const now = new Date()
  const diffInMilliseconds = now.getTime() - date.getTime()

  if (Math.abs(diffInMilliseconds) < 1000 || diffInMilliseconds < 0) {
    return 'только что'
  }

  return formatDistanceToNow(date, { addSuffix: true, locale: ru })
}

const timeUtils = {
  isLastDayOfMonth,
  isFirstDayOfMonth,
  isWithinInterval,
  isAfter,
  isBefore,
  subDays,
  addDays,
  isSameDay,
  formatDate,
  timeAgo,
  addMonths,
  addWeeks,
  subMonths,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  intervalToDuration,
  differenceInCalendarDays,
}

export default timeUtils
