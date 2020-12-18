import { toRefs, reactive, readonly } from 'vue'

const store = reactive({ alerts: [] })
let id = 0;

const addAlert = (message, type) => {
  store.alerts.unshift({ id: id, type: type, message: message })
  id = ++id;
}

const success = message => addAlert(message, 'success')
const info = message => addAlert(message, 'info')
const warning = message => addAlert(message, 'warning')
const error = message => addAlert(message, 'error')

export default readonly({
  ...toRefs(store),
  success,
  info,
  warning,
  error
});
