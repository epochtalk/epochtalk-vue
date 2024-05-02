import * as dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(timezone)

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

  // TODO(akinsey): load users timezone setting from saved preferences
  // otherwise guess timzone.
  let convertedDate = dayjs.utc(dateStr).tz(dayjs.tz.guess())

  if (hideTime) {
    if (isToday) { result = 'Today' }
    else if (isMaxDate) { result = 'Permanent' } // bans
    else { result = convertedDate.format('MMM D, YYYY') }
  }
  else if (customFormat) result = convertedDate.format(customFormat)
  else {
    if (timezone) {
      if (isToday) { result = 'Today at ' +  convertedDate.format('h:mm A').tz(timezone) }
      else if (isThisYear) { result = convertedDate.format('MMMM D [at] h:mm A').tz(timezone) }
      else { result = convertedDate.format('MMM D, YYYY [at] h:mm A').tz(timezone) }
    }
    else {
      if (isToday) { result = 'Today at ' +  convertedDate.format('h:mm A') }
      else if (isThisYear) { result = convertedDate.format('MMMM D [at] h:mm A') }
      else { result = convertedDate.format('MMM D, YYYY [at] h:mm A') }
    }
  }
  return result
}
