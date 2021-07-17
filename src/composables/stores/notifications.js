import { toRefs, reactive, readonly } from 'vue'
import { mentionsApi, notificationsApi } from '@/api'
import alertStore from '@/composables/stores/alert'

const store = reactive({ messages: 0, mentions: 0, mentionsList: [] })

const refreshMentionsList = () => {
  return mentionsApi.page({ limit: 10 })
  .then(mentions => store.mentionsList = mentions.data)
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
  .then(() => refreshMentionsList())
  .catch(err => {
    alertStore.error('There was an error dismissing your mentions.')
    console.log(err)
  })
}

export default readonly({
  ...toRefs(store),
  refreshMentionsList,
  refresh,
  dismiss,
  deleteMention
})
