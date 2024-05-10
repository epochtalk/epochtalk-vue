import * as dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import localStorageCache from '@/composables/utils/localStorageCache'
const $prefs = localStorageCache(0, 'app').get('preferences')

dayjs.extend(timezone)

export default (dateStr, hideTime, customFormat) => {
  if (!dateStr) return dateStr

  let storedTz = $prefs.data ? $prefs.data.timezone_offset : null
  let timezoneOffset = storedTz ? storedTz.sign + (Number(storedTz.hours * 60) + Number(storedTz.minutes)) : null

  let result
  let now = new Date()
  let maxDate = new Date(8640000000000000)
  let date = new Date(dateStr)
  let isToday = now.toDateString() === date.toDateString()
  let isThisYear = now.getYear() === date.getYear()
  let isMaxDate = maxDate.getTime() === date.getTime()

  // TODO(akinsey): load users timezone setting from saved preferences
  // otherwise guess timzone.
  console.log("tz offset:", timezoneOffset)
  console.log("raw date str:", dateStr)
  console.log("date:", date, date.getTime())
  console.log("dayjs:", dayjs(date.getTime()))
  console.log("dayjs:", dayjs(date.getTime()).utcOffset(timezoneOffset))
  let convertedDate = dayjs.utc(dateStr).tz(dayjs.tz.guess())

  if (hideTime) {
    if (isToday) { result = 'Today' }
    else if (isMaxDate) { result = 'Permanent' } // bans
    else { result = convertedDate.format('MMM D, YYYY') }
  }
  else if (customFormat) result = convertedDate.format(customFormat)
  else {
    // TODO(akinsey): properly apply timezone fetched from prefs
    if (isToday) { result = 'Today at ' +  convertedDate.format('h:mm A') }
    else if (isThisYear) { result = convertedDate.format('MMMM D [at] h:mm A') }
    else { result = convertedDate.format('MMM D, YYYY [at] h:mm A') }
  }
  return result
}
