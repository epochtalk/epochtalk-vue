<template>
  <table class="threads-list">
    <caption>Threads</caption>
    <thead>
      <tr>
        <th class="subject">Threads</th>
        <th class="views-replies">
          <span>Replies</span>
          <span>Views</span>
        </th>
        <th class="last-post">Last Post</th>
      </tr>
    </thead>
    <tbody>
      <tr class="threads-data" v-for="thread in threadData.data.threads" :key="thread.id">
        <td class="subject">
          <div class="title">
            <div class="thread-state">
              <svg class="is-unread" v-if="thread.has_new_post" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                <title></title>
                <g id="icons">
                  <circle cx="16" cy="16" r="16" />
                </g>
              </svg>
            </div>
            <router-link :to="{ name: 'Posts', params: { threadSlug: thread.slug, threadId: thread.id }}" :class="{bold: thread.has_new_post}" class="thread-title">{{thread.title}}</router-link>
              <div class="thread-state-secondary">
              <span class="thread-state-locked" v-if="thread.locked">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <title></title>
                  <path d="M40,21H37.5V16.48a13.5,13.5,0,0,0-27,0V21H8a2,2,0,0,0-2,2V43a2,2,0,0,0,2,2H40a2,2,0,0,0,2-2V23A2,2,0,0,0,40,21ZM15.5,16.48a8.5,8.5,0,0,1,17,0V21h-17Z"/>
                </svg>
              </span>
              <span class="thread-state-hasPoll" v-if="thread.poll">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path class="cls-1" d="M42,2H6A4,4,0,0,0,2,6V42a4,4,0,0,0,4,4H42a4,4,0,0,0,4-4V6A4,4,0,0,0,42,2ZM13.75,40h-6V32h6Zm9,0h-6V22h6Zm9,0h-6V27h6Zm9,0h-6V12h6Z"/>
              </svg>
              </span>
            </div>
          </div>

          <div class="started-by">
            Started by
            <span v-if="thread.user.deleted">deleted</span>
            <a v-if="!thread.user.deleted" ui-sref="#">{{thread.user.username}}</a>
            <span>{{' on ' + humanDate(thread.created_at)}}</span>
          </div>
        </td>

        <td class="views-replies">
          <span class="replies">{{thread.post_count - 1 || 0}}</span>
          <span class="views">{{thread.view_count || 0}}</span>
        </td>

        <td class="last-post">
          <span v-if="thread.last_deleted">deleted</span>
          <img v-if="!thread.last_deleted" class="avatar-small {{$webConfigs.default_avatar_shape}}"
            ng-src="{{thread.last_post_avatar || $webConfigs.default_avatar}}" />
          <a v-if="!thread.last_deleted" ui-sref="profile.posts({ username: thread.last_post_username })"
            ng-bind="thread.last_post_username"></a> posted on
          <a ui-sref="posts.data({ slug: thread.slug, start: thread.last_post_position, '#': thread.last_post_id })"><span ng-bind="thread.last_post_created_at | humanDate"></span>.</a>
          <span v-if="thread.has_new_post">
            <a
              ui-sref="posts.data({ slug: thread.slug, start: thread.latest_unread_position, '#': thread.latest_unread_post_id })">(Last unread post)</a>
          </span>
        </td>
      </tr>
    </tbody>
  </table>
  <pagination v-if="threadData.data?.threads" :page="threadData.data.page" :limit="threadData.data.limit" :count="threadData.data.threads.count"></pagination>
</template>

<script>
// import { useRoute } from 'vue-router'
import Pagination from '@/components/layout/Pagination.vue'
import humanDate from '@/composables/filters/humanDate'
// import truncate from '@/composables/filters/truncate'
import { reactive, toRefs } from 'vue'
import { threadsApi } from '@/api'
// import { AuthStore } from '@/composables/stores/auth'
import { localStoragePrefs } from '@/composables/stores/prefs'
// import { BreadcrumbStore } from '@/composables/stores/breadcrumbs'

export default {
  name: 'Posts',
  components: { Pagination },
  beforeRouteEnter(to, from, next) {
    const params = {
      limit: localStoragePrefs().data.threads_per_page,
      page: to.query.page || 1
    }
    threadsApi.postedIn(params).then(data => next(vm => vm.threadData.data = data))
  },
  setup() {
    /* Internal Methods */
    /* View Methods */
    /* Internal Data */
    /* View Data */
    const v = reactive({
      threadData: { data: {} }
    })
    return {
      ...toRefs(v),
      humanDate
    }
  }
}
</script>
