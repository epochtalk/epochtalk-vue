<template>
  <div class="user-search">
    <div class="member-search-field">
      <div class="nested-input-container">
        <a v-if="search" @click="clearSearch()" class="nested-clear-btn fa fa-times"></a>
        <a @click="searchUsers()" class="nested-btn">Search</a>
        <input class="input-text nested-input" type="search" v-model="searchStr" id="search-users" placeholder="Search users by username" @keydown="$event.which === 13 && searchUsers()" @keyup="$event.which === 27 && clearSearch()" />
      </div>
    </div>

    <div class="member-search-results" v-if="searchData && (searchData.count > 0 || search)">
      <div v-if="search">
      Displaying {{searchData.count}} search result(s) for "<strong>{{search}}</strong>":<br /><br />
      </div>
      <table width="100%">
        <thead class="members-header">
          <tr>
            <th class="pointer" ><span :class="getSortClass('username')"></span>&nbsp;Username</th>
            <th class="pointer" ><span :class="getSortClass('role')"></span>&nbsp;Role</th>
            <th class="pointer"><span :class="getSortClass('post_count')"></span>&nbsp;Post Count</th>
            <th class="pointer hide-mobile" ><span :class="getSortClass('created_at')"></span>&nbsp;Registered Date</th>
          </tr>
        </thead>
        <tbody class="members">
          <tr v-if="searchData?.count <= 0">
            <td class="centered-text" colspan="4"><h5>No users to display</h5></td>
          </tr>
          <tr v-for="user in searchData?.users" :key="user.username">
            <td class="username">
              <a class="search-users user-avatar hide-mobile" href="">
                <img :src="user.avatar || defaultAvatar">
              </a>
              <a href="" v-html="user.username"></a>
            </td>
            <td v-html="user.role"></td>
            <td v-html="user.post_count"></td>
            <td class="hide-mobile">{{ user.created_at }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="sidebar">
    <div class="sidebar-block" v-if="searchData?.page_count > 1">
       <pagination :page="searchData.page" :limit="searchData.limit" :count="searchData.count"></pagination>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, computed } from 'vue'
import { usersApi } from '@/api'
import Pagination from '@/components/layout/Pagination.vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'About',
  components: { Pagination },
  beforeRouteEnter(to, from, next) {
    const params = {
      limit: 15,
      page: to.query.page || 1,
      field: to.query.field,
      desc: to.query.desc
    }
    next(vm => usersApi.memberSearch(params).then(d => vm.searchData = d).catch(() => {}))
  },
  beforeRouteUpdate(to, from, next) {
    const params = {
      limit: 15,
      page: to.query.page || 1,
      field: to.query.field,
      desc: to.query.desc
    }
    usersApi.memberSearch(params).then(d => this.searchData = d).catch(() => {})
    next()
  },
  setup() {
    const pageUsers = inc => {
      const params = { ...$route.params, saveScrollPos: true }
      // Handle different pagination controls (threads) prev/next vs (posts) actual pagination
      const newPage = v.threads && inc ? v.postData.page + inc : v.currentPage
      let query = { ...$route.query, page: newPage }
      if (query.page === 1 || !query.page) delete query.page
      if ($route.query.page !== v.currentPage)
        $router.replace({ name: $route.name, params: params, query: query })
    }

    const searchUsers = () => console.log('search users')
    const clearSearch = () => console.log('clear search')

    const setSortField = () => {
      // // Get/Set new sort field
      // if (newField) v.sortField = newField
      // else newField = v.sortField
      // // Convert desc query param to boolean
      // let desc = $route.query.desc === 'false' ? false : true
      // // Sort Field hasn't changed just toggle desc
      // const defaultField = newField === 'updated_at' && !$route.query.field
      // if (defaultField || newField === $route.query.field) desc = !desc
      // else desc = true // Sort field changed, default to desc true
      // // Update router to have new query params, watch on query params will update data
      // let query = { field: newField, page: $route.query.page }
      // if (!query.page) delete query.page // don't include page if undefined
      // if (newField === 'updated_at') delete query.field // do not display default field in qs
      // if (!desc) query.desc = false  // only display desc in query string when false
      // const params = { ...$route.params, saveScrollPos: true } // save scroll pos when sorting table
      // $router.replace({ name: $route.name, params: params, query: query })
    }

    const getSortClass = field => {
      let sortClass = 'fa '
      const desc = v.searchData.desc
      const curField = v.searchData.field
      const defaultField = field === 'updated_at' && !curField
      if ((defaultField || curField === field) && desc) sortClass += 'fa-sort-down'
      else if ((defaultField || curField === field) && !desc) sortClass += 'fa-sort-up'
      else sortClass += 'fa-sort'
      return sortClass
    }

    const $route = useRoute()
    const $router = useRouter()

    const v = reactive({
      currentPage: Number($route.query.page) || 1,
      pages: computed(() => v.searchData?.page_count),
      search: computed(() => v.searchData?.search),
      searchData: null,
      searchStr: null,
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
    })
    return { ...toRefs(v), searchUsers, clearSearch, setSortField, getSortClass, pageUsers }
  }
}
</script>

<style lang="scss">
.member-search main #public-content { grid-template-areas: 'header header' 'main sidebar' 'main sidebar'; }
.user-search { grid-area: main; }
.sidebar {
  grid-area: sidebar;

  .sidebar-block {
    display: block;
    position: sticky;
    top: $header-offset;
  }
}

.members td {
  height: 6.25rem;
  padding-left: 0;
  padding-right: 0;
}

.user-avatar img {
  object-fit: cover;
  height: 6.25rem;
  width: 6.25rem;
  display: inline-block;
  vertical-align: middle;
  margin-right: .5rem
}
.members-header th { text-align: left; }
</style>
