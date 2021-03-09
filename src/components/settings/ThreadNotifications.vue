<template>
  <div id="thread-notification-settings" class="settings-section">
    <h3 class="thin-underline">Thread Notification Settings</h3>

    <div class="toggle-switch-container">
      <div class="">
        <label for="thread-notifications">Thread Notifications Enabled</label>
        <label class="desc-label" for="thread-notifications">Receive an email when there are replies to threads you have created or participated in.</label>
      </div>
      <div class="">
        <input id="thread-notifications" class="toggle-switch" type="checkbox" v-model="enabled" @click="toggleThreadNotifications()">
        <label for="thread-notifications"></label>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, onBeforeMount, toRefs } from 'vue'
import { threadsApi } from '@/api'

export default {
  name: 'thread-notifications',
  setup() {
    onBeforeMount(() => {
      console.log('here')
      threadsApi.notifications().then(d => v.enabled = d.notify_replied_threads)
    })
    /* View Methods */
    const toggleThreadNotifications = () => console.log('toggleThreadNotifications')
    const v = reactive({ enabled: null })

    return { toggleThreadNotifications, ...toRefs(v) }
  }
}
</script>
