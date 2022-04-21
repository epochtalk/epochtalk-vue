import * as dayjs from 'dayjs'

export default (dateStr, hideTime, customFormat) => {
  if (!dateStr) return dateStr
  //let timezone = PreferencesSvc.preferences.timezone_offset || ''
  let timezone
  let result
  let now = new Date()
  let maxDate = new Date(8640000000000000)
  let date = new Date(dateStr)
  let isToday = now.toDateString() === date.toDateString()
  let isThisYear = now.getYear() === date.getYear()
  let isMaxDate = maxDate.getTime() === date.getTime()
  if (hideTime) {
    if (isToday) { result = 'Today' }
    else if (isMaxDate) { result = 'Permanent' } // bans
    else { result = dayjs(dateStr).format('MMM D, YYYY') }
  }
  else if (customFormat) result = dayjs(dateStr).format(customFormat)
  else {
    if (timezone) {
      if (isToday) { result = 'Today at ' +  dayjs(dateStr).format('h:mm A').tz(timezone) }
      else if (isThisYear) { result = dayjs(dateStr).format('MMMM D [at] h:mm A').tz(timezone) }
      else { result = dayjs(dateStr).format('MMM D, YYYY [at] h:mm A').tz(timezone) }
    }
    else {
      if (isToday) { result = 'Today at ' +  dayjs(dateStr).format('h:mm A') }
      else if (isThisYear) { result = dayjs(dateStr).format('MMMM D [at] h:mm A') }
      else { result = dayjs(dateStr).format('MMM D, YYYY [at] h:mm A') }
    }
  }
  return result
}
