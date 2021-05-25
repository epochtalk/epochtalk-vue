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
      <!-- table -->
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
// import { usersApi } from '@/api'
import Pagination from '@/components/layout/Pagination.vue'
import { useRoute, useRouter } from 'vue-router'
import humanDate from '@/composables/filters/humanDate'

export default {
  name: 'PostSearch',
  components: { Pagination },
  // beforeRouteEnter(to, from, next) {
  //   const query = {
  //     limit: 10,
  //     page: to.query.page || 1,
  //     field: to.query.field,
  //     desc: to.query.desc,
  //     search: to.query.search
  //   }
  //   next(vm => usersApi.memberSearch(query).then(d => vm.searchData = d).catch(() => {}))
  // },
  // beforeRouteUpdate(to, from, next) {
  //   const query = {
  //     limit: 10,
  //     page: to.query.page || 1,
  //     field: to.query.field,
  //     desc: to.query.desc,
  //     search: to.query.search
  //   }
  //   usersApi.memberSearch(query).then(d => this.searchData = d).catch(() => {})
  //   next()
  // },
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
      searchInput: null,
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
    })

    nextTick(() => v.searchInput.focus())

    return { ...toRefs(v), searchPosts, clearSearch, humanDate }
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
