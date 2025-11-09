/**
 * Отформатировать число в человекочитаемый вид (добавить пробелы между порядками).
 * 212824 -> "212 824"
 * */
const formatNumber = (num: number | string) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
}

const formatUtils = { formatNumber }
export default formatUtils
