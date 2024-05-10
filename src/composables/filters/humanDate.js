import * as dayjs from 'dayjs'
import { get } from 'lodash'
import localStorageCache from '@/composables/utils/localStorageCache'
const $prefs = localStorageCache(0, 'app').get('preferences')

export default (dateStr, hideTime, customFormat) => {
  if (!dateStr) return dateStr

  // get stored timezone offset from prefs
  const storedTz = get($prefs, 'data.timezone_offset')
  // if sign exists, stored timezone offset is valid
  // load timezone offset as hours from sign, hours, minutes
  const timezoneOffset = get(storedTz, 'sign') ? Number(storedTz.sign + (Number(storedTz.hours) + Number(storedTz.minutes) / 60)) : null
  // check if timezone offset is valid, handle 0 (which is a valid offset)
  const timezoneOffsetValid = timezoneOffset || timezoneOffset == 0

  // convert using only dayjs
  let result
  const now = dayjs()
  // offset "now" to calculate isToday/isThisYear in local timezone
  const nowLocal = timezoneOffsetValid ? now.utcOffset(timezoneOffset) : now.tz(dayjs.tz.guess())
  // ECMAScript max date
  const dateMax = dayjs(8640000000000000)
  const date = dayjs.utc(dateStr)
  // offset "date" to calculate isToday/isThisYear in local timezone
  const dateLocal = timezoneOffsetValid ? date.utcOffset(timezoneOffset) : date.tz(dayjs.tz.guess())
  const isToday = dateLocal.isSame(nowLocal, 'day')
  const isThisYear = dateLocal.isSame(nowLocal, 'year')
  const isMaxDate = dateLocal.isSame(dateMax)

  if (hideTime) {
    if (isToday) { result = 'Today' }
    else if (isMaxDate) { result = 'Permanent' } // bans
    else { result = dateLocal.format('MMM D, YYYY') }
  }
  else if (customFormat) result = dateLocal.format(customFormat)
  else {
    if (isToday) { result = 'Today at ' +  dateLocal.format('h:mm A') }
    else if (isThisYear) { result = dateLocal.format('MMMM D [at] h:mm A') }
    else { result = dateLocal.format('MMM D, YYYY [at] h:mm A') }
  }
  return result
}
