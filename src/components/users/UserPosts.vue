<template>
  <div class="user-profile-posts">
    <div class="table-actions">
      <button @click="toggleThreads(true)" :class="{'active': threads}">
        <strong>Threads&nbsp;</strong> <span class="username">by {{username}}</span>
      </button>

      <button @click="toggleThreads(false)" :class="{'active': !threads}">
        <strong>Posts&nbsp;</strong> <span class="username">by {{username}}</span>
      </button>
    </div>

    <!-- User's Paged Posts -->
    <div v-if="!threads && postData">
      <div class="pagination-wrap" v-if="postData?.count > postData?.limit">
        <simple-pagination
          v-model="currentPage"
          :pages="pages"
          :range-size="1"
          @update:modelValue="pagePosts"
        />
      </div>

      <div class="no-table-contents" v-if="!postData?.posts?.length">
        <br />
        <h4>This user has no posts to display</h4>
      </div>

      <div v-if="postData && postData?.posts?.length">
        <table class="profile-posts-table" width="100%">
          <thead>
            <th class="thread">Thread</th>
            <th class="timestamp pointer" @click="setDesc()"><span :class="getSortClass()"></span>&nbsp;Post Date</th>
          </thead>

          <tbody>
            <tr v-for="post in postData?.posts" :key="post.id">
              <td :data-balloon="decode(post.thread_title)" data-balloon-pos="top">
                <div class="truncate-title">
                  <span v-if="post.hidden && !post._deleted"><i class="fa fa-eye-slash"></i></span>
                  <router-link v-if="!post._deleted" class="thread-title"  :title="decode(post.thread_title)" :to="{ name: 'Posts', params: { threadSlug: post.thread_slug }, query: { start: post.position }, hash: `#${post.id}` }">
                    <span v-html="decode(post.thread_title)"></span>
                  </router-link>
                  <span v-if="post._deleted">Deleted</span>
                </div>
                <div class="post" @click="post.open = !post.open">
                  <div class="post-body" :class="{ closed: !post.open }" v-html="post.body_html"></div>
                </div>
              </td>
              <td class="timestamp">{{humanDate(post.created_at)}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="threads && postData">
      <!-- User's Paged Threads -->

      <div class="pagination-wrap" v-if="postData.posts.length > 0">
        <div class="pagination-simple">
          <button @click="pagePosts(-1)" :disabled="!postData?.prev">&#10094; Prev</button>
          <button @click="pagePosts(1)" :disabled="!postData?.next">Next &#10095;</button>
        </div>
      </div>

      <div class="no-table-contents" v-if="!postData?.posts.length">
        <br />
        <h4>This user has no threads to display</h4>
      </div>
      <div v-if="postData?.posts.length">
        <table class="profile-posts-table" width="100%">
          <thead>
            <th class="thread">Thread</th>
            <th class="timestamp pointer" @click="setDesc()"><span :class="getSortClass()"></span>&nbsp;Post Date</th>
          </thead>

          <tbody>
            <tr v-for="post in postData?.posts" :key="post.id">
              <td :data-balloon="decode(post.thread_title)" data-balloon-pos="top">
                <div class="truncate-title">
                  <span v-if="post.hidden && !post._deleted"><i class="fa fa-eye-slash"></i></span>
                  <router-link v-if="!post._deleted" class="thread-title"  :title="decode(post.thread_title)" :to="{ name: 'Posts', params: { threadSlug: post.thread_slug }, query: { start: post.position }, hash: `#${post.id}` }">
                    <span v-html="decode(post.thread_title)"></span>
                  </router-link>
                  <span v-if="post._deleted">Deleted</span>
                </div>
                <div class="post" @click="post.open = !post.open">
                  <div class="post-body" :class="{ closed: !post.open }" v-html="post.body_html"></div>
                </div>
              </td>
              <td class="timestamp">{{humanDate(post.created_at)}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import humanDate from '@/composables/filters/humanDate'
import { reactive, toRefs, computed, inject, watch } from 'vue'
import { postsApi, threadsApi } from '@/api'
import { PreferencesStore, localStoragePrefs } from '@/composables/stores/prefs'
import { useRoute, useRouter } from 'vue-router'
import SimplePagination from '@/components/layout/SimplePagination.vue'
import decode from '@/composables/filters/decode'

export default {
  name: 'UserPosts',
  components: { SimplePagination },
  props: [ 'user', 'username' ],
  beforeRouteEnter(to, from, next) {
    next(vm => {
      const params = {
        username: to.params.username,
        limit: localStoragePrefs().data.posts_per_page,
        page: to.query.page || 1,
        field: to.query.field,
        desc: to.query.desc
      }
      if (vm.threads) threadsApi.byUser(params).then(d => vm.postData = d)
      else postsApi.byUser(params)
        .then(d => {
          vm.postData = d
          vm.currentPage = d.page
        })
    })
  },
  beforeRouteUpdate(to, from, next) {
    const params = {
      username: to.params.username,
      limit: localStoragePrefs().data.posts_per_page,
      page: to.query.page || 1,
      field: to.query.field,
      desc: to.query.desc
    }
    if (this.threads) threadsApi.byUser(params).then(d => this.postData = d)
    else postsApi.byUser(params)
      .then(d => {
        this.postData = d
        this.currentPage = d.page
      })
    next()
  },
  setup(props) {
    const pagePosts = inc => {
      const params = { ...$route.params, saveScrollPos: true }
      // Handle different pagination controls (threads) prev/next vs (posts) actual pagination
      const newPage = v.threads && inc ? v.postData.page + inc : v.currentPage
      let query = { ...$route.query, page: newPage }
      if (query.page === 1 || !query.page) delete query.page
      if ($route.query.page !== v.currentPage)
        $router.replace({ name: $route.name, params: params, query: query })
    }

    const refresh = () => {
      const params = {
        username: $route.params.username,
        limit: v.prefs.posts_per_page,
        page: $route.query.page || 1,
        field: $route.query.field,
        desc: $route.query.desc
      }
      if (v.threads) threadsApi.byUser(params).then(d => v.postData = d)
      else postsApi.byUser(params).then(d => v.postData = d)
    }

    const toggleThreads = threads => {
      const params = { ...$route.params, saveScrollPos: true }
      if (threads) $router.replace({ name: $route.name, params: params, query: { threads }})
      else $router.replace({ name: $route.name, params: params })
      v.threads = threads
    }

    const setDesc = () => {
      const params = { ...$route.params, saveScrollPos: true }
      let query = { ...$route.query, desc: !v.postData.desc }
      if (query.desc) delete query.desc
      $router.replace({ name: $route.name, params, query })
    }
    const getSortClass = field => {
      let sortClass = 'fa '
      const desc = v.postData?.desc
      const curField = v.postData?.field
      const defaultField = field === 'updated_at' && !curField
      if ((defaultField || curField === field) && desc) sortClass += 'fa-sort-down'
      else if ((defaultField || curField === field) && !desc) sortClass += 'fa-sort-up'
      else sortClass += 'fa-sort'
      return sortClass
    }

    const $route = useRoute()
    const $router = useRouter()
    const $prefs = inject(PreferencesStore)

    const v = reactive({
      currentPage: Number($route.query.page) || 1,
      pages: computed(() => Math.ceil(v.postData?.count  / v.postData?.limit)),
      prefs: $prefs.data,
      threads: !!$route.query.threads,
      postData: null
    })

    // Refresh posts if user is updated, account may be deactivated
    watch(() => props.user, () => refresh())

    return { ...toRefs(v), pagePosts, toggleThreads, setDesc, getSortClass, humanDate, decode }
  }
}
</script>

<style lang="scss">
.profile-posts-table {
  table-layout: fixed;
  thead th {
    text-align: left;
    border-bottom: 1px solid $border-color;
  }
  tr {
    td {
      font-size: $base-font-size;
      line-height: 1.3;
      padding: 0.5rem 0;
      vertical-align: top;
    }
  }
  .timestamp {
    color: $text-gray-med;
    min-width: 150px;
    padding-left: 1rem;
    width: 25%;
  }
  .truncate-title {
    width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .thread-title { font-weight: 600; }
  .post {
    cursor: pointer;
    padding: 0 0.25rem;
    transition: all ease-in-out 200ms;
    &:hover { background-color: darken($base-background-color, 5%); }
  }
  .post-body {
    white-space: pre-wrap;
    &.open { background-color: darken($base-background-color, 5%); }
    ul, ol {
      white-space: normal;
    }
    &.closed {
      width: 100%;
      max-height: 18px;
      white-space: pre-wrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .no-table-contents {
    color: $text-gray-med;
    font-size: $font-size-med;
    font-weight: 400;
  }
  @include break-mobile-med {
    display: grid;
    grid-template-columns: 1fr;
    thead, th, tbody, tr { display: contents; }
    thead { display: none; }
    tr {
      display: flex;
      flex-direction: column;
      padding: 0.5rem 0;
      width: calc(100vw - 2rem);
      td { padding: 0; }
    }
    .timestamp {
      font-size: $font-size-sm;
      padding: 0;
      order: -1;
      width: 100%;
    }
  }
}

.pagination-wrap { margin-top: 1rem; }

.table-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  button {
    background: transparent;
    border-bottom: 1px solid rgba(0,0,0,0);
    border-radius: 0;
    color: $text-gray-dark;
    margin-right: 2rem;
    padding: 0.5rem 0;
    &:hover, &:hover:focus, &:focus {
      background: inherit;
      border-bottom: 1px solid rgba($color-primary, .8);
      color: rgba($color-primary, .8);
      box-shadow: none;
      transform: initial;
      margin-right: 2rem;
      padding: 0.5rem 0;
    }
    &.active {
      color: $color-primary;
      border-bottom: 1px solid rgba($color-primary, .8);
      margin-right: 2rem;
      padding: 0.5rem 0;
    }
  }

  @include break-mobile-med {
    margin-bottom: 1rem;
    margin-top: 2rem;
    button { font-size: $font-size-sm; }
    .username { display: none; }
  }
}
</style>
