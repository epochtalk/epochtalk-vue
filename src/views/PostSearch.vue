<template>
  <div class="main">
    <div class="search-field">
      <div class="nested-input-container">
        <a v-if="searchData?.search" @click="clearSearch()" class="nested-clear-btn fa fa-times pointer"></a>
        <a @click="search ? searchPosts() : null" :class="{ 'disabled': (!search || search === searchData?.search), 'pointer': search }" class="nested-btn">Search</a>
        <input class="input-text nested-input" type="search" v-model="search" id="search-posts" placeholder="Search for post" @keydown="$event.which === 13 && searchPosts()" @keyup="$event.which === 27 && clearSearch()" ref="searchInput" />
      </div>
    </div>

    <div v-if="!searchData?.posts.length">
      <h4>Enter a search term above, to search forum posts</h4>
    </div>
    <div class="search-results" v-if="searchData && (searchData.posts.length > 0 || search)">
      <div v-if="searchData?.search">
      Displaying{{ searchData.posts.length === 0 ? ' 0 ' : ' '}}search result(s) for "<strong>{{searchData.search}}</strong>":<br /><br />
      </div>

      <div :id="post.id" v-for="(post, i) in searchData.posts" :key="post.id" class="post-block" :class="{ 'hidden': post.hidden, 'deleted': post._deleted || post.user.ignored, 'first': i === 0 }">
        <!-- Delete Post View -->
        <div class="deleted" v-if="post._deleted || post.user.ignored">
          Post
          <span v-if="post._deleted">Deleted</span>
          <span v-if="post.user.ignored">Ignored</span>
          <small class="pointer" v-if="post.user.ignored" @click="post.user.ignored = false">
            <strong>- Show Post</strong>
          </small>
        </div>

        <!-- Visible Post View -->
        <div v-if="!post._deleted && !post.user.ignored">

          <!-- Post Body Section -->
          <div class="post-content">
            <!-- Post Title -->
            <div class="thread-title">
              <h5>
                <router-link :title="decode(post.thread_title)" :to="{ name: 'Posts', params: { threadSlug: post.thread_slug }, query: { start: post.position }, hash: `#${post.id}` }"><span v-html="decode(post.thread_title)"></span></router-link>
              </h5>
              <span v-if="post.user.online" :data-balloon="post.user.username + ' is online'" class="online green"><i class="fas fa-circle"></i></span>
              <span v-if="!post.user.online" class="online green"><i class="far fa-circle"></i></span>
              <router-link :to="{ path: '/profile/' + post.user.username.toLowerCase() }" class="username"><span v-html="decode(post.thread_title)"></span></router-link>
              <div class="posted-in">posted in</div>
              <router-link class="board-name" :to="{ name: 'Threads', params: { boardSlug: post.board_slug } }"><span v-html="post.board_name"></span></router-link>
              <div class="timestamp">{{ humanDate(post.created_at) }}</div>
              <div class="clear"></div>
            </div>
            <!-- Post Body -->
            <!--TODO(akinsey): post-processing="post.body_html" style-fix="true"-->
            <div class="post-body" :class="{ 'rtl': post.right_to_left }" v-html="post.body_html"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="actions-bottom" v-if="searchData?.posts.length > 0">
    <div class="pagination-slide">
      <div class="pagination-controls">
        <button @click="pageResults(-1)" :disabled="!searchData?.prev">&#10094; Prev</button>
        <div class="page">{{currentPage}}</div>
        <button @click="pageResults(1)" :disabled="!searchData?.next">Next &#10095;</button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, nextTick, watch, computed } from 'vue'
import { postsApi } from '@/api'
import { useRoute, useRouter } from 'vue-router'
import humanDate from '@/composables/filters/humanDate'
import { usernameHighlight } from '@/composables/utils/userUtils'
import decode from '@/composables/filters/decode'
import { isOnline } from '@/composables/services/websocket'

export default {
  name: 'PostSearch',
  beforeRouteEnter(to, from, next) {
    const query = {
      limit: 10,
      page: to.query.page || 1,
      field: to.query.field,
      desc: to.query.desc,
      search: to.query.search
    }
    next(vm => postsApi.postSearch(query)
    .then(d => {
      vm.searchData = d
      vm.checkUsersOnline()
    }).catch(() => {}))
  },
  beforeRouteUpdate(to, from, next) {
    const query = {
      limit: 10,
      page: to.query.page || 1,
      field: to.query.field,
      desc: to.query.desc,
      search: to.query.search
    }
    postsApi.postSearch(query)
    .then(d => {
      this.searchData = d
      this.checkUsersOnline()
    }).catch(() => {})
    next()
  },
  setup() {
    const searchPosts = () => {
      let query = { ...$route.query, search: v.search }
      delete query.field
      delete query.desc
      delete query.page
      $router.replace({ name: $route.name, params: $route.params, query: query })
      v.searchInput.focus()
    }

    const pageResults = inc => {
      const newPage = v.searchData.page + inc
      let query = { ...$route.query, page: newPage }
      if (query.page === 1 || !query.page) delete query.page
      if ($route.query.page !== v.currentPage)
        $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const clearSearch = () => {
      let query = { ...$route.query }
      delete query.field
      delete query.desc
      delete query.search
      delete query.page
      $router.replace({ name: $route.name, params: $route.params, query: query })
      v.search = null
      v.searchInput.focus()
    }

    const checkUsersOnline = () => {
      let uniqueUsers = {}
      v.searchData.posts.forEach(post => uniqueUsers[post.user_id] = 'user')
      Object.keys(uniqueUsers).map(user => isOnline(user, setOnline))
    }

    const setOnline = (err, data) => {
      if (err) console.log(err)
      else {
        v.searchData.posts.map(post => {
          if (post.user_id === data.id) {
            post.user.online = data.online
          }
        })
      }
    }

    const $route = useRoute()
    const $router = useRouter()

    const v = reactive({
      currentPage: computed(() => Number($route.query.page) || 1),
      searchData: null,
      search: $route.query.search,
      searchInput: null
    })

    nextTick(() => v.searchInput.focus())
    // Updates page input when user uses header search
    watch(() => $route.query.search, s => v.search = s)

    return { ...toRefs(v), searchPosts, pageResults, clearSearch, humanDate, usernameHighlight, decode, checkUsersOnline }
  }
}
</script>

<style lang="scss">
.post-search main #public-content {
  grid-template-areas: 'header header' 'main sidebar' 'main sidebar';
  @include break-mobile-sm { grid-template-areas: unset; }
}
.main { grid-area: main; }
.search-results {
  @include pad(0 0 1rem 0);
  clear: both;
  grid-area: main;

  .post-block {
    @include clearfix;
    @include pad(2rem 0);
    @include transition(background-color 250ms ease-in);
    position: relative;
    border-top: 1px solid $border-color;
    &.first { border-top: 0; padding-top: 0.5rem; }
    &.hidden { background-color: $sub-header-color; }
    &.deleted { display: none; }
    mark { background-color: $color-highlighted; font-weight: bold; display:inline; color: $base-font-color; }
    .post-body {
      color: $secondary-font-color-dark;
    }
    .post-content {
      display: block;
      .thread-title {
        color: $secondary-font-color-dark;
        margin-bottom: 0.5rem;
        width: 100%;
        .board-name {
          color: $base-font-color;
          margin-right: 0.25rem;
          float: left;
          &:hover { color: $color-primary; }
        }
        .posted-in { margin-right: 0.25rem; float: left; }
        h5 { margin-bottom: 0; color: $base-font-color; }
        .online { float: left; margin-right: 0.5rem; }
        a.username {
          float: left;
          color: $base-font-color;
          font-weight: 900;
          margin-right: 0.25rem;
          &:hover { color: $color-primary; }
        }
        .timestamp, .display-name {
          display: inline-block;
          color: $secondary-font-color;
          line-height: 1.3rem;
          font-size: 0.8125rem;
          font-weight: 400;
          float: left;
        }
        .display-name { color: $secondary-font-color-dark; }
        .clear { @include clearfix; }
      }
    }
  }
}
</style>
