import { toRefs, reactive, readonly } from 'vue'

const store = reactive({ alerts: [] })
let id = 0

const addAlert = (msg, type) => {
  // Destructure and handle SWRV object's errors in here to make Vue Component code cleaner
  if (typeof msg === 'object') {
    const error = msg.error
    if (error) { // detect error in swrv object
      switch (error.message) {
        case 'Network Error':
          msg = `${error.message}. Cannot connect to server, please try again later or contact an administrator`
          break
        default:
          msg = `${error.name}: ${error.message}`
      }
    }
    else return // no error do nothing
  }

  store.alerts.unshift({ id: id, type: type, message: msg })
  id = ++id
}

const success = message => addAlert(message, 'success')
const info = message => addAlert(message, 'info')
const warn = message => addAlert(message, 'warning')
const error = message => addAlert(message, 'error')

export default readonly({
  ...toRefs(store),
  success,
  info,
  warn,
  error
})
