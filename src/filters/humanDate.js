import * as dayjs from 'dayjs'

export default function(dateStr, hideTime) {
  //var timezone = PreferencesSvc.preferences.timezone_offset || '';
  var timezone;
  var result;
  var now = new Date();
  var maxDate = new Date(8640000000000000);
  var date = new Date(dateStr);
  var isToday = now.toDateString() === date.toDateString();
  var isThisYear = now.getYear() === date.getYear();
  var isMaxDate = maxDate.getTime() === date.getTime();
  if (hideTime) {
    if (isToday) { result = 'Today'; }
    else if (isMaxDate) { result = 'Permanent'; } // bans
    else { result = dayjs(dateStr).format('MMMM d, y'); }
  }
  else {
    if (timezone) {
      if (isToday) { result = 'Today at ' +  dayjs(dateStr).format('h:mm a').tz(timezone); }
      else if (isThisYear) { result = dayjs(dateStr).format('MMMM d [at] h:mm a').tz(timezone); }
      else { result = dayjs(dateStr).format('MMMM d, y [at] h:mm a').tz(timezone); }
    }
    else {
      if (isToday) { result = 'Today at ' +  dayjs(dateStr).format('h:mm a'); }
      else if (isThisYear) { result = dayjs(dateStr).format('MMMM d [at] h:mm a'); }
      else { result = dayjs(dateStr).format('MMMM d, y [at] h:mm a'); }
    }
  }
  return result;
}
