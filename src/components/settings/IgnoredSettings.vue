<template>
  <div id="ignored-users-posts-settings">
    <h3 class="thin-underline">Ignored User</h3>
    <div class="tabs">
      <a class="button" :class="{ 'selected': selectedTab === 'posts' }" @click.prevent="selectedTab = 'posts'">Posts</a>
      <a class="button" :class="{ 'selected': selectedTab === 'messages' }" @click.prevent="selectedTab = 'messages'">Messages</a>
      <a class="button" :class="{ 'selected': selectedTab === 'mentions' }" @click.prevent="selectedTab = 'mentions'">Mentions</a>
    </div>
    <div class="tabs-content">
      <ignored-settings-partial :api="usersApi" v-show="selectedTab === 'posts'" />
      <ignored-settings-partial :api="messagesApi" v-show="selectedTab === 'messages'" />
      <ignored-settings-partial :api="mentionsApi" v-show="selectedTab === 'mentions'" />
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
    const v = reactive({ selectedTab: 'posts' })
    return { ...toRefs(v), usersApi, messagesApi, mentionsApi }
  }
}
</script>
