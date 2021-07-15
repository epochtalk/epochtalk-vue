import { toRefs, reactive, readonly } from 'vue'
import { mentionsApi, notificationsApi } from '@/api'
import alertStore from '@/composables/stores/alert'

const store = reactive({ messages: 0, mentions: 0, mentionsList: [] })

// const addAlert = (msg, type) => {
//   // Destructure and handle SWRV object's errors in here to make Vue Component code cleaner
//   if (typeof msg === 'object') {
//     const error = msg.error
//     if (error) { // detect error in swrv object
//       switch (error.message) {
//         case 'Network Error':
//           msg = `${error.message}. Cannot connect to server, please try again later or contact an administrator`
//           break
//         default:
//           msg = `${error.name}: ${error.message}`
//       }
//     }
//     else return // no error do nothing
//   }

//   store.alerts.unshift({ id: id, type: type, message: msg })
// }

// const success = message => addAlert(message, 'success')
// const info = message => addAlert(message, 'info')
// const warn = message => addAlert(message, 'warning')
// const error = message => addAlert(message, 'error')

const refreshMentionsList = () => {
  return mentionsApi.page({ limit: 10 })
  .then(mentions => Object.assign(store.mentionsList, mentions.data))
  .catch(console.log)
}

const refresh = () => {
  return notificationsApi.counts({ max: 99 })
  .then(counts => {
    store.messages = counts.message
    store.mentions = counts.mention
  })
  .catch(console.log)
}

const dismiss = opts => {
  if (opts.viewed) return
  else {
    delete opts.viewed
    return notificationsApi.dismiss(opts)
    .catch(err => {
      alertStore.error('There was an error dismissing your notifications.')
      console.log(err)
    })
  }
}

const deleteMention = opts => {
  return notificationsApi.dismiss({ type: opts.type, id: opts.notification_id })
  .then(() => mentionsApi.remove(opts))
  .catch(err => {
    alertStore.error('There was an error dismissing your mentions.')
    console.log(err)
  })
}

// function getMentionsList() {
//   return mentionsList;
// }

// function getMessages() { return messages; }

// function getMentions() { return mentions; }

export default readonly({
  ...toRefs(store),
  refreshMentionsList,
  refresh,
  dismiss,
  deleteMention
})
