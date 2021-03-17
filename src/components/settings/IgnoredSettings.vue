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
            <input id="enable-message-emails" class="toggle-switch" type="checkbox" v-model="messageEmailsDisabled" @click="enableMessageEmails()">
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
            <input id="enable-mention-emails" class="toggle-switch" type="checkbox" v-model="mentionEmailsDisabled" @click="enableMentionEmails()">
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
import { reactive, toRefs } from 'vue'
import { usersApi, messagesApi, mentionsApi } from '@/api'
import IgnoredSettingsPartial from '@/components/settings/IgnoredSettingsPartial.vue'

export default {
  name: 'ignored-settings',
  components: { IgnoredSettingsPartial },
  setup() {
    const enableMessageEmails = () => console.log('Enable Messages Email')
    const enableNewbieMessages = () => console.log('Enable Newbie Messages')
    const enableMentionEmails = () => console.log('Enable Mention Emails')

    const v = reactive({
      selectedTab: 'posts',
      messageEmailsDisabled: false,
      mentionEmailsDisabled: false,
      ignoreNewbies: false
    })
    return { ...toRefs(v), enableMessageEmails, enableNewbieMessages, enableMentionEmails, usersApi, messagesApi, mentionsApi }
  }
}
</script>
