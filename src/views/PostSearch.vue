<template>
  <div class="main">
    <div class="user-search-field">
      <div class="nested-input-container">
        <a v-if="searchData?.search" @click="clearSearch()" class="nested-clear-btn fa fa-times pointer"></a>
        <a @click="search ? searchPosts() : null" :class="{ 'disabled': (!search || search === searchData?.search), 'pointer': search }" class="nested-btn">Search</a>
        <input class="input-text nested-input" type="search" v-model="search" id="search-posts" placeholder="Search for post" @keydown="$event.which === 13 && searchPosts()" @keyup="$event.which === 27 && clearSearch()" ref="searchInput" />
      </div>
    </div>

    <div class="user-search-results" v-if="searchData && (searchData.count > 0 || search)">
      <div v-if="searchData?.search">
      Displaying {{searchData.count}} search result(s) for "<strong>{{searchData.search}}</strong>":<br /><br />
      </div>
      <div :id="post.id" v-for="post in searchData.posts" :key="post.id" class="post-block" :class="{ 'hidden': post.hidden, 'deleted': post._deleted || post.user.ignored, 'first': $first }">
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
                <a href="#" v-html="post.thread_title"></a>
              </h5>
              <span v-if="post.user.online" :data-balloon="post.user.username + ' is online'" class="online green"><i class="fa fa-circle"></i></span>
              <span v-if="!post.user.online" class="online green"><i class="fa fa-circle-o"></i></span>
              <a class="username" :data-balloon="post.user.role_name || 'User'" href="#" :style="usernameHighlight(post.user.highlight_color)" v-html="post.user.username"></a>
              <div class="posted-in">posted in</div>
              <a class="board-name" href="#" v-html="post.board_name"></a>
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
  <div class="sidebar">
    <div class="sidebar-block" v-if="searchData?.page_count > 1">
      <pagination :page="searchData.page" :limit="searchData.limit" :count="searchData.count" />
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, nextTick } from 'vue'
import { postsApi } from '@/api'
import Pagination from '@/components/layout/Pagination.vue'
import { useRoute, useRouter } from 'vue-router'
import humanDate from '@/composables/filters/humanDate'
import { usernameHighlight } from '@/composables/utils/userUtils'

export default {
  name: 'PostSearch',
  components: { Pagination },
  beforeRouteEnter(to, from, next) {
    const query = {
      limit: 10,
      page: to.query.page || 1,
      field: to.query.field,
      desc: to.query.desc,
      search: to.query.search
    }
    next(vm => postsApi.postSearch(query).then(d => vm.searchData = d).catch(() => {}))
  },
  beforeRouteUpdate(to, from, next) {
    const query = {
      limit: 10,
      page: to.query.page || 1,
      field: to.query.field,
      desc: to.query.desc,
      search: to.query.search
    }
    postsApi.postSearch(query).then(d => this.searchData = d).catch(() => {})
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

    const $route = useRoute()
    const $router = useRouter()

    const v = reactive({
      currentPage: Number($route.query.page) || 1,
      searchData: null,
      search: $route.query.search,
      searchInput: null
    })

    nextTick(() => v.searchInput.focus())

    return { ...toRefs(v), searchPosts, clearSearch, humanDate, usernameHighlight }
  }
}
</script>

<style lang="scss">
.post-search main #public-content { grid-template-areas: 'header header' 'main sidebar' 'main sidebar'; }
.main { grid-area: main; }
.sidebar {
  grid-area: sidebar;
  .sidebar-block {
    display: block;
    position: sticky;
    top: $header-offset;
  }
}
</style>
