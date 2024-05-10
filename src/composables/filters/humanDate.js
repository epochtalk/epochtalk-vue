import * as dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import localStorageCache from '@/composables/utils/localStorageCache'
const $prefs = localStorageCache(0, 'app').get('preferences')

dayjs.extend(timezone)

export default (dateStr, hideTime, customFormat) => {
  if (!dateStr) return dateStr

  let storedTz = $prefs.data ? $prefs.data.timezone_offset : null
  let timezoneOffset = storedTz ? Number(storedTz.sign + (Number(storedTz.hours * 60) + Number(storedTz.minutes))) : null

  let result
  let now = new Date()
  let maxDate = new Date(8640000000000000)
  let date = new Date(dateStr + 'Z')
  let isToday = now.toDateString() === date.toDateString()
  let isThisYear = now.getYear() === date.getYear()
  let isMaxDate = maxDate.getTime() === date.getTime()

  // if timezoneOffset is set in prefs, apply it, otherwise guess timzone
  let convertedDate = timezoneOffset ? dayjs.utc(date).utcOffset(timezoneOffset) : dayjs.utc(dateStr).tz(dayjs.tz.guess())

  if (hideTime) {
    if (isToday) { result = 'Today' }
    else if (isMaxDate) { result = 'Permanent' } // bans
    else { result = convertedDate.format('MMM D, YYYY') }
  }
  else if (customFormat) result = convertedDate.format(customFormat)
  else {
    if (isToday) { result = 'Today at ' +  convertedDate.format('h:mm A') }
    else if (isThisYear) { result = convertedDate.format('MMMM D [at] h:mm A') }
    else { result = convertedDate.format('MMM D, YYYY [at] h:mm A') }
  }
  return result
}
