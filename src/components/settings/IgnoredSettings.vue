<template>
  <div id="ignored-users-posts-settings">
    <h3 class="thin-underline">Ignored User</h3>
    <div class="tabs">
      <a class="button" :class="{ 'selected': selectedTab === 'posts' }" @click.prevent="selectedTab = 'posts'">Posts</a>
      <a class="button" :class="{ 'selected': selectedTab === 'messages' }" @click.prevent="selectedTab = 'messages'">Messages</a>
      <a class="button" :class="{ 'selected': selectedTab === 'mentions' }" @click.prevent="selectedTab = 'mentions'">Mentions</a>
    </div>
    <div class="tabs-content">
      <div v-show="selectedTab === 'posts'">
        <ignored-settings-partial :api="usersApi" />
      </div>
      <div v-show="selectedTab === 'messages'">
        <div class="toggle-switch-container">
          <div>
            <label for="enable-message-emails">Send me an Email when I'm messaged</label>
            <label class="desc-label" for="enable-message-emails">Receive an email when users message you</label>
          </div>
          <div>
            <input id="enable-message-emails" class="toggle-switch" type="checkbox" v-model="emailMessages" @click="enableMessageEmails()">
            <label for="enable-message-emails"></label>
          </div>
        </div>
        <div class="toggle-switch-container">
          <div>
            <label for="enable-newbie-messages">Ignore Newbie Messages</label>
            <label class="desc-label" for="enable-newbie-messages">Do not allow newbie members to message you</label>
          </div>
          <div>
            <input id="enable-newbie-messages" class="toggle-switch" type="checkbox" v-model="ignoreNewbies" @click="enableNewbieMessages()">
            <label for="enable-newbie-messages"></label>
          </div>
        </div>
        <br>
        <ignored-settings-partial :api="messagesApi" />
      </div>
      <div v-show="selectedTab === 'mentions'">
        <div class="toggle-switch-container">
          <div>
            <label for="enable-mention-emails">Send me an Email when I'm mentioned</label>
            <label class="desc-label" for="enable-mention-emails">Receive an email when there are thread replies which mention you</label>
          </div>
          <div>
            <input id="enable-mention-emails" class="toggle-switch" type="checkbox" v-model="emailMentions" @click="enableMentionEmails()">
            <label for="enable-mention-emails"></label>
          </div>
        </div>
        <br>
        <ignored-settings-partial :api="mentionsApi" />
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, inject, onBeforeMount } from 'vue'
import { usersApi, messagesApi, mentionsApi } from '@/api'
import IgnoredSettingsPartial from '@/components/settings/IgnoredSettingsPartial.vue'

export default {
  name: 'ignored-settings',
  components: { IgnoredSettingsPartial },
  setup() {
    onBeforeMount(() => {
      mentionsApi.settings().then(s => v.emailMentions = s.email_mentions)
      messagesApi.settings()
      .then(s => {
        v.emailMessages = s.email_messages
        v.ignoreNewbies = s.ignore_newbies
      })
    })

    const enableMessageEmails = () => messagesApi.emailNotifications(!v.emailMessages)
      .then(() => $alertStore.success('Successfully updated message notification settings.'))
      .catch(() => {
        v.emailMessages = !v.emailMessages
        $alertStore.error('There was an error updating your message notification settings.')
      })

    const enableNewbieMessages = () => messagesApi.ignoreNewbies(!v.ignoreNewbies)
      .then(() => $alertStore.success('Successfully updated newbie message settings.'))
      .catch(() => {
        v.ignoreNewbies = !v.ignoreNewbies
        $alertStore.error('There was an error updating your newbie message settings.')
      })

    const enableMentionEmails = () => mentionsApi.emailNotifications(!v.emailMentions)
      .then(() => $alertStore.success('Successfully updated mention notification settings.'))
      .catch(() => {
        v.emailMentions = !v.emailMentions
        $alertStore.error('There was an error updating your mention notification settings.')
      })

    const $alertStore = inject('$alertStore')

    const v = reactive({
      selectedTab: 'posts',
      emailMentions: null,
      emailMessages: null,
      ignoreNewbies: null
    })
    return { ...toRefs(v), enableMessageEmails, enableNewbieMessages, enableMentionEmails, usersApi, messagesApi, mentionsApi }
  }
}
</script>

<style lang="scss">
.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: .5rem;
  margin-top: .4rem;
  margin-bottom: .5rem;
  a.button {
    display: inline-block;
    background-color: transparent;
    color: $secondary-font-color;
    height: 2.5rem;
    padding: 0 1rem;
    line-height: 2.5rem;
    font-size: 1rem;
    &.selected {
      border: 1px solid $color-primary;
      border-radius: 3px;
      color: $color-primary;
      &:hover { background-color: transparent; }
    }
    &:hover { background-color: transparent; }
  }
  @include break-mobile-sm {
    grid-template-columns: 1fr;
  }
}
.tabs-content { min-height: 29rem }
</style>
