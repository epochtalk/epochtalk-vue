<template>
  <div class="thread-data">
    <h1 class="view-title">Threads Posted In</h1>
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
        <tr class="threads-data" v-for="thread in threadData?.threads" :key="thread.id">
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
              <router-link v-if="!thread.user.deleted" :to="{ path: '/profile/' + thread.user.username.toLowerCase() }" v-html="thread.user.username"></router-link>
              <span>{{' on ' + humanDate(thread.created_at)}}</span>
            </div>
          </td>
          <td class="views-replies">
            <span class="replies">{{thread.post_count - 1 || 0}}</span>
            <span class="views">{{thread.view_count || 0}}</span>
          </td>
          <td class="last-post">
            <span v-if="thread.last_deleted">deleted</span>
            <router-link v-if="!thread.last_deleted" :to="{ path: '/profile/' + thread.last_post_username.toLowerCase() }"><img :src="thread.last_post_avatar || defaultAvatar" :class="`avatar-small ${defaultAvatarShape}`"/></router-link>
             <router-link v-if="!thread.last_deleted" :to="{ path: '/profile/' + thread.last_post_username.toLowerCase() }" v-html="thread.last_post_username"></router-link> posted on
            <router-link :to="{ name: 'Posts', params: { threadSlug: thread.slug, threadId: thread.id }, query: { start: thread.last_post_position }, hash: '#' + thread.last_post_id }"><span>{{humanDate(thread.last_post_created_at)}}</span>.</router-link>
            <span v-if="thread.has_new_post">
              <router-link :to="{ name: 'Posts', params: { threadSlug: thread.slug, threadId: thread.id }, query: { start: thread.latest_unread_position }, hash: '#' + thread.latest_unread_post_id }">(Last unread post)</router-link>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="sidebar" v-if="threadData?.count > threadData?.limit">
    <div class="sidebar-block" v-if="threadData?.threads">
      <pagination :page="threadData.page" :limit="threadData.limit" :count="threadData.count"></pagination>
    </div>
    <div class="pagination-wrap">
      <simple-pagination
        v-model="currentPage"
        :pages="pages"
        :range-size="1"
        @update:modelValue="pageResults"
      />
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/layout/Pagination.vue'
import humanDate from '@/composables/filters/humanDate'
import { reactive, computed, toRefs } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { threadsApi } from '@/api'
import { localStoragePrefs } from '@/composables/stores/prefs'
import SimplePagination from '@/components/layout/SimplePagination.vue'

export default {
  name: 'ThreadsPostedIn',
  components: { Pagination, SimplePagination },
  beforeRouteEnter(to, from, next) {
    const params = {
      limit: localStoragePrefs().data.threads_per_page,
      page: to.query.page || 1
    }
    threadsApi.postedIn(params).then(data => next(vm => vm.threadData = data ))
  },
  beforeRouteUpdate(to) {
    const params = {
      limit: localStoragePrefs().data.threads_per_page,
      page: to.query.page || 1
    }
    threadsApi.postedIn(params).then(data => this.threadData = data )
  },
  setup() {
    const pageResults = page => {
      let query = { ...$route.query, page: page }
      if (query.page === 1 || !query.page) delete query.page
      if ($route.query.page !== v.currentPage)
        $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const $route = useRoute()
    const $router = useRouter()

    /* View Data */
    const v = reactive({
      currentPage: Number($route.query.page) || 1,
      pages: computed(() => Math.ceil(v.threadData?.count  / v.threadData?.limit)),
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
      threadData: null
    })
    return { ...toRefs(v), pageResults, humanDate }
  }
}
</script>

<style scoped lang="scss">
.threads-posted-in main #public-content { grid-template-areas: 'header header' 'main sidebar' 'main sidebar'; }
.thread-data { grid-area: main; }
.sidebar {
  grid-area: sidebar;
  .sidebar-block {
    display: block;
    position: sticky;
    top: $header-offset;
  }
  .pagination-wrap { display: none; }
  @include break-mobile-sm {
    border-top: 1px solid $border-color;
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    background: $base-background-color;
    padding: 0.75rem;
    z-index: 1000;
    margin: 0 auto;
    width: 100vw;
    .sidebar-block { display: none; }
    .pagination-wrap { display: block; }
  }
}
</style>
