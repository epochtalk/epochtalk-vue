<template>
  <div class="full-width">
    <div class="admin-table-header row">
      <div class="column">
        <div class="row">
          <div class="column">
            <div class= "row">
              <div class="management-users radio-button column">
                <input type="radio" class="hide-radio" name="table-filter" :value="undefined" id="users-filter-0" v-model="query.filter" @click="setFilter()" />
                <label for="users-filter-0">All</label>
              </div>
              <div class="management-users radio-button column">
                <input type="radio" class="hide-radio" name="table-filter" :value="'banned'" id="users-filter-1" v-model="query.filter" @click="setFilter('banned')" />
                <label for="users-filter-1">Banned</label>
              </div>
            </div>
          </div>
          <div class="header-spacer column">
            <select @change="searchStr = ''" v-model="query.ip">
              <option :value="undefined">Search by Username</option>
              <option :value="true">Search by IP Address</option>
            </select>
          </div>
        </div>
      </div>
      <div class="user-search column">
        <div class="nested-input-container" v-if="!query?.ip">
          <a v-if="query.search" @click="clearSearch()" class="nested-clear-btn fa fa-times"></a>
          <a @click="searchUsers()" class="nested-btn">Search</a>
          <input class="input-text nested-input" v-model="searchStr" type="text" id="search-users" placeholder="Type a username" ng-keydown="$event.which === 13 && AdminManagementCtrl.searchUsers()" ng-keyup="$event.which === 27 && AdminManagementCtrl.clearSearch()" />
        </div>
        <div class="nested-input-container" v-if="query?.ip">
          <a v-if="query?.search" @click="clearSearch()" class="nested-clear-btn fa fa-times"></a>
          <a @click="searchUsers()" class="nested-btn">Search</a>
          <input class="input-text nested-input" v-model="searchStr" type="text" id="search-users" ng-pattern="AdminManagementCtrl.ipRegex" placeholder="Type an IP address" ng-keydown="$event.which === 13 && AdminManagementCtrl.searchUsers()" ng-keyup="$event.which === 27 && AdminManagementCtrl.clearSearch()" />
        </div>
      </div>
    </div>
    <div class="user-content fill-row centered-text" v-if="!query?.search && count < 1">
      <h4>No Users to display in <strong>{{query?.filter ? 'Banned' : 'All'}}</strong></h4>
    </div>
    <div class="user-content fill-row" v-if="count > 0 || query?.search">
      <div v-if="query.search">
      Displaying {{count}} search result(s) for "<strong>{{search}}</strong>" in <strong>{{query?.filter ? 'Banned': 'All'}}</strong>:<br /><br />
      </div>
      <table class="underlined" width="100%">
        <thead>
          <th class="pointer" @click="setSortField('username')"><span :class="getSortClass('username')"></span>&nbsp;Username</th>
          <th class="pointer" :class="{'hide-mobile': query?.filter === 'banned' }" @click="setSortField('email')"><span :class="getSortClass('email')"></span>&nbsp;Email</th>
          <th class="pointer" v-if="query?.filter === 'banned'" @click="setSortField('ban_expiration')"><span :class="getSortClass('ban_expiration')"></span>&nbsp;Ban Expiration</th>
          <th class="pointer hide-mobile" @click="setSortField('created_at')"><span :class="getSortClass('created_at')"></span>&nbsp;Registered Date</th>
          <th class="hide-mobile">Last Active Date</th>
          <th class="hide-mobile">IP Addresses</th>
          <th class="user-actions">Actions</th>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.username">
            <td><a href="" v-html="user.username"></a>
            <i v-if="user.ban_expiration" class="fa fa-user-times right"></i>
            </td>
            <td class="email-column" :class="{'hide-mobile': query?.filter === 'banned' }"><a :href="'mailto:${user.email}'" v-html="user.email"></a></td>
            <td v-if="query?.filter === 'banned'">{{humanDate(user.ban_expiration, true)}}</td>
            <td class="hide-mobile">{{humanDate(user.created_at)}}</td>
            <td class="hide-mobile">{{humanDate(user.last_active) || '--'}}</td>
            <td class="hide-mobile">
              <span v-for="(ip, index) in user.user_ips" :key="ip">
                <span v-html="ip"></span>{{ index !== user.user_ips.length - 1 ? ', ' : '' }}
              </span>
              <span v-if="!user.user_ips.length">Not Available</span>
            </td>
            <td class=user-actions>
              <!-- <a ui-sref="users-posts({ username: user.username })"> -->
              <a href="#">
                <button class="icon" data-balloon="View Posts">
                  <i class="fas fa-file"></i>
                </button>
              </a>

              <button class="icon" data-balloon="Edit Profile" ng-click="AdminManagementCtrl.showEditUser(user.username)">
                <i class="fas fa-edit"></i>
              </button>

              <button class="icon" data-balloon="Manage Bans" ng-click="AdminManagementCtrl.showManageBans(user)" ng-disabled="!AdminManagementCtrl.actionAccess.userControls.privilegedBan">
                <i class="fa fa-ban"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination-wrap"> <!-- v-if="postData?.count > postData?.limit -->
          <simple-pagination
            v-model="currentPage"
            :pages="pages"
            :range-size="1"
            @update:modelValue="pageResults"
          />
        <!-- <pagination page-count="AdminManagementCtrl.pageCount" page="AdminManagementCtrl.page" query-params="AdminManagementCtrl.queryParams"></pagination> -->
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usersApi } from '@/api'
import EventBus from '@/composables/services/event-bus'
import humanDate from '@/composables/filters/humanDate'
import SimplePagination from '@/components/layout/SimplePagination.vue'

export default {
  name: 'UserManagement',
  components: { SimplePagination },
  beforeRouteEnter(to, from, next) {
    let queryParams = {
      field: to.query.field,
      desc: to.query.desc,
      limit: Number(to.query.limit) || 15,
      page: Number(to.query.page) || 1,
      filter: to.query.filter,
      search: to.query.search,
      ip: to.query.ip
    }
    usersApi.page(queryParams)
    .then(users => {
      usersApi.count(queryParams)
      .then(d => next(vm => {
        vm.query = queryParams
        vm.users = users
        vm.count = d.count
        vm.pages = computed(() => Math.ceil(d.count  / queryParams.limit))
      }))
    })
  },
  beforeRouteUpdate(to, from, next) {
    let queryParams = {
      field: to.query.field,
      desc: to.query.desc,
      limit: Number(to.query.limit) || 15,
      page: Number(to.query.page) || 1,
      filter: to.query.filter,
      search: to.query.search,
      ip: to.query.ip
    }
    usersApi.page(queryParams)
    .then(users => {
      usersApi.count(queryParams)
      .then(d => {
        this.query = queryParams
        this.users = users
        this.count = d.count
        this.pages = computed(() => Math.ceil(d.count  / queryParams.limit))
        next()
      })
    })
  },
  setup() {
    const saveListener = () => {
      console.log('Admin Save Moderation!')
    }
    const resetListener = () => {
      console.log('Admin Reset Moderation!')
    }
    onMounted(() => {
      EventBus.on('admin-save', saveListener)
      EventBus.on('admin-reset', resetListener)
    })
    onUnmounted(() => {
      EventBus.off('admin-save', saveListener)
      EventBus.off('admin-reset', resetListener)
    })

    const pageResults = page => {
      let query = { ...$route.query, page: page }
      if (query.page === 1 || !query.page) delete query.page
      if ($route.query.page !== v.currentPage)
        $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const setSortField = newField => {
      // Get/Set new sort field
      if (newField) v.sortField = newField
      else newField = v.sortField
      // Convert desc query param to boolean
      let desc = $route.query.desc === 'false' || !$route.query.desc ? false : true
      // Sort Field hasn't changed just toggle desc
      const defaultField = newField === 'username' && !$route.query.field
      if (defaultField || newField === $route.query.field) desc = !desc
      else desc = true // Sort field changed, default to desc true
      // Update router to have new query params, watch on query params will update data
      let query = { limit: $route.query.limit, field: newField, filter: $route.query.filter, page: $route.query.page }
      if (!query.page) delete query.page // don't include page if undefined
      if (newField === 'username') delete query.field // do not display default field in qs
      if (desc) query.desc = true // do not display desc if false
      const params = { ...$route.params, saveScrollPos: true } // save scroll pos when sorting table
      $router.replace({ name: $route.name, params: params, query: query })
    }

    const getSortClass = field => {
      let sortClass = 'fa '
      const desc = v.query?.desc
      const curField = v.query?.field
      const defaultField = field === 'username' && !curField
      if ((defaultField || curField === field) && desc) sortClass += 'fa-sort-down'
      else if ((defaultField || curField === field) && !desc) sortClass += 'fa-sort-up'
      else sortClass += 'fa-sort'
      return sortClass
    }

    const setFilter = filter => {
      let query = { filter: filter }
      const params = { ...$route.params, saveScrollPos: true } // save scroll pos when sorting table
      $router.replace({ name: $route.name, params, query: query })
    }
    const clearSearch = () => {}
    const searchUsers = () => {}

    const $router = useRouter()
    const $route = useRoute()

    const v = reactive({
      currentPage: Number($route.query.page) || 1,
      users: {},
      count: 0,
      pages: null,
      query: {},
      sortField: 'username',
      searchStr: $route.query.search
    })
    return { ...toRefs(v), pageResults, setFilter, getSortClass, setSortField, clearSearch, searchUsers, humanDate }
  }
}
</script>

<style lang="scss" scoped>
.admin-table-header {
  background-color: $sub-header-color;
  position: absolute;
  left: 0;
  right: 0;
  padding: 1rem;
  padding-top: 2rem;
  top: 0.4rem;

  @include break-mobile-sm { padding: 1.25rem 1rem 0; margin: 0 -1rem 2rem; }
}
.row {
  display: flex;
  flex-flow: row;
  row-gap: 0;
}
.column {
  flex: 50%;
}
.nested-input { margin-bottom: 0; }
.nested-btn { margin-bottom: 1rem; }

.radio-button label {
  text-align: center;
  height: 2.25rem;
  border-radius: 3px;
}
.user-content {
  margin-top: 6rem;
}

table.underlined {
  border: none;
  margin-bottom: 1rem;
  thead {
    text-align: left;
    font-size: 0.875rem;
    background-color: transparent;
    border-bottom: $border-alt;
    th { color: $secondary-font-color; font-weight: 400; padding-bottom: 0.5rem; padding-left: 0.5rem; }
    th.left-icon-col { width: 1.5rem; }
    // th.mod-actions { width: 5.25rem; }
    // th.user-actions { width: 8rem; }
  }
  tr {
    border-bottom: 1px solid $border-color-alt;
    vertical-align: top;
    &.selectable-row { @include no-select; }
    &.selectable-row:hover { background-color: $sub-header-color; }
    &.active-row, &.active-row:nth-of-type(even) { background-color: $color-primary; }
    &.active-row.selectable-row:hover { background-color: $color-primary }
    &.active-row td { color: $button-text-color; }
    &.active-row td a, &.active-row td button { color: darken($color-primary-alt, 10%); }
    &.active-row td a:hover, &.active-row td button:not([disabled]):hover { color: $color-primary-alt; }
    &:nth-of-type(even) { background: transparent; }
    &:nth td { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    &.active-row td.left-icon-col { color: $button-text-color; }
    td.left-icon-col {
      @include pad(0 0 0 0.5rem);
      color: $secondary-font-color;
      padding-top: 0.5rem;
    }
    td {
      padding-top: 0.5rem;
      padding-right: 0.5rem;
      padding-bottom: 0.5rem;
      vertical-align: top;

      &:last-child {
        padding-right: 0;
      }
    }

    td input { margin-bottom: 0; }
  }

  .user-actions,
  .mod-actions {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
