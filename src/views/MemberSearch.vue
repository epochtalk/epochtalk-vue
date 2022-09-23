<template>
  <div class="user-search">
    <div class="member-search-field">
      <div class="nested-input-container">
        <a v-if="searchData?.search" @click="clearSearch()" class="nested-clear-btn fa fa-times pointer"></a>
        <a @click="search ? searchUsers() : null" :class="{ 'disabled': (!search || search === searchData?.search), 'pointer': search }" class="nested-btn">Search</a>
        <input class="input-text nested-input" type="search" v-model="search" id="search-users" placeholder="Search users by username" @keydown="$event.which === 13 && searchUsers()" @keyup="$event.which === 27 && clearSearch()" ref="searchInput" />
      </div>
    </div>

    <div class="member-search-results" v-if="searchData && (searchData.count > 0 || search)">
      <div v-if="searchData?.search">
      Displaying {{searchData.count}} search result(s) for "<strong>{{searchData.search}}</strong>":<br /><br />
      </div>
      <table width="100%">
        <thead class="members-header">
          <tr>
            <th class="pointer" width="45%" @click.prevent="setSortField('username')"><span :class="getSortClass('username')"></span>&nbsp;Username</th>
            <th class="pointer" width="20%" @click.prevent="setSortField('role')"><span :class="getSortClass('role')"></span>&nbsp;Role</th>
            <th class="pointer" width="10%" @click.prevent="setSortField('post_count')"><span :class="getSortClass('post_count')"></span>&nbsp;Post Count</th>
            <th class="pointer hide-mobile" width="25%" @click.prevent="setSortField('created_at')"><span :class="getSortClass('created_at')"></span>&nbsp;Registered Date</th>
          </tr>
        </thead>
        <tbody class="members">
          <tr v-if="searchData?.count <= 0">
            <td class="centered-text" colspan="4"><h5>No users to display</h5></td>
          </tr>
          <tr v-for="user in searchData?.users" :key="user.username">
            <td class="username">
              <router-link :to="{ path: '/profile/' + user.username.toLowerCase() }" :class="defaultAvatarShape" class="search-users user-avatar hide-mobile" href="">
                <img :src="user.avatar || defaultAvatar">
              </router-link>
              <router-link :to="{ path: '/profile/' + user.username.toLowerCase() }" v-html="user.username" />
            </td>
            <td v-html="user.role"></td>
            <td v-html="user.post_count"></td>
            <td class="hide-mobile">{{ humanDate(user.created_at, false, 'MM/DD/YYYY, h:mm A') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="sidebar" v-if="searchData?.page_count > 1">
    <div class="sidebar-block">
      <pagination :page="searchData.page" :limit="searchData.limit" :count="searchData.count" />
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
import { reactive, toRefs, nextTick, computed } from 'vue'
import { usersApi } from '@/api'
import Pagination from '@/components/layout/Pagination.vue'
import { useRoute, useRouter } from 'vue-router'
import humanDate from '@/composables/filters/humanDate'
import SimplePagination from '@/components/layout/SimplePagination.vue'

export default {
  name: 'MemberSearch',
  components: { Pagination, SimplePagination },
  beforeRouteEnter(to, from, next) {
    const query = {
      limit: 10,
      page: to.query.page || 1,
      field: to.query.field,
      desc: to.query.desc,
      search: to.query.search
    }
    next(vm => usersApi.memberSearch(query).then(d => vm.searchData = d).catch(() => {}))
  },
  beforeRouteUpdate(to, from, next) {
    const query = {
      limit: 10,
      page: to.query.page || 1,
      field: to.query.field,
      desc: to.query.desc,
      search: to.query.search
    }
    usersApi.memberSearch(query).then(d => this.searchData = d).catch(() => {})
    next()
  },
  setup() {
    const pageResults = page => {
      let query = { ...$route.query, page: page }
      if (query.page === 1 || !query.page) delete query.page
      if ($route.query.page !== v.currentPage)
        $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const searchUsers = () => {
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

    const setSortField = newField => {
      // Get/Set new sort field
      if (newField) v.sortField = newField
      else newField = v.sortField
      // Convert desc query param to boolean
      let desc = !!$route.query.desc
      // Sort Field hasn't changed just toggle desc
      const defaultField = newField === 'username' && !$route.query.field
      if (defaultField || newField === $route.query.field) desc = !desc
      else desc = true // Sort field changed, default to desc true
      // Update router to have new query params, watch on query params will update data
      let query = { field: newField, search: $route.query.search, page: $route.query.page }
      if (!query.search) delete query.search
      if (!query.page) delete query.page // don't include page if undefined
      if (newField === 'username') delete query.field // do not display default field in qs
      if (desc) query.desc = true  // only display desc in query string when false
      const params = { ...$route.params, saveScrollPos: true } // save scroll pos when sorting table
      $router.replace({ name: $route.name, params: params, query: query })
    }

    const getSortClass = field => {
      let sortClass = 'fa '
      const desc = v.searchData.desc
      const curField = v.searchData.field
      const defaultField = field === 'username' && !curField
      if ((defaultField || curField === field) && desc) sortClass += 'fa-sort-down'
      else if ((defaultField || curField === field) && !desc) sortClass += 'fa-sort-up'
      else sortClass += 'fa-sort'
      return sortClass
    }

    const $route = useRoute()
    const $router = useRouter()

    const v = reactive({
      currentPage: Number($route.query.page) || 1,
      pages: computed(() => Math.ceil(v.searchData?.count  / v.searchData?.limit)),
      searchData: null,
      search: $route.query.search,
      searchInput: null,
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
    })

    nextTick(() => v.searchInput.focus())

    return { ...toRefs(v), pageResults, searchUsers, clearSearch, setSortField, getSortClass, humanDate }
  }
}
</script>

<style lang="scss">
.member-search main #public-content { grid-template-areas: 'header header' 'main sidebar' 'main sidebar'; }
@media screen and (max-width: 767px) {
  .member-search main #public-content {
    grid-template-areas:
      "header header"
      "main main"
      "sidebar sidebar";
  }
}
.user-search { grid-area: main; width: 100%; }
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
.members td {
  height: 6.25rem;
  padding-left: 0;
  padding-right: 0;
}

.user-avatar {
  img {
    object-fit: cover;
    width: calc(#{$avatar-width  * .666});
    height: calc(#{$avatar-width  * .666});
    display: inline-block;
    vertical-align: middle;
    margin-right: .5rem
  }
  &.circle img { @include border-radius(100%); }
  &.rect img { height: calc(#{($avatar-width  * .666)}/ 1.5); }
}

.members-header th { text-align: left; }
</style>
