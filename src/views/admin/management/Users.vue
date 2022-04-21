<template>
  <div class="full-width">
    <div class="admin-table-header row">
      <div class="column">
        <div class="row">
          <div class="column">
            <div class= "row">
              <div class="management-users radio-button column">
                <input type="radio" class="hide-radio" name="table-filter" :value="'banned'" id="users-filter-0" v-model="query.filter" @click="setFilter()" />
                <label for="users-filter-0">All</label>
              </div>
              <div class="management-users radio-button column">
                <input type="radio" class="hide-radio" name="table-filter" :value="undefined" id="users-filter-1" v-model="query.filter" @click="setFilter('banned')" />
                <label for="users-filter-1">Banned</label>
              </div>
            </div>
          </div>
          <div class="header-spacer column">
            <select @change="searchStr = ''" v-model="query.ip">
              <option :value="false">Search by Username</option>
              <option :value="true">Search by IP Address</option>
            </select>
          </div>
        </div>
      </div>
      <div class="user-search column">
        <div class="nested-input-container" v-if="!query?.ip">
          <a v-if="query.search" @click="clearSearch()" class="nested-clear-btn fa fa-times"></a>
          <a @click="searchUsers()" class="nested-btn">Search</a>
          <input class="input-text nested-input" v-model="searchStr" type="text" id="search-users" placeholder="Search users by username" ng-keydown="$event.which === 13 && AdminManagementCtrl.searchUsers()" ng-keyup="$event.which === 27 && AdminManagementCtrl.clearSearch()" />
        </div>
        <div class="nested-input-container" v-if="query?.ip">
          <a v-if="query?.search" @click="clearSearch()" class="nested-clear-btn fa fa-times"></a>
          <a @click="searchUsers()" class="nested-btn">Search</a>
          <input class="input-text nested-input" v-model="searchStr" type="text" id="search-users" ng-pattern="AdminManagementCtrl.ipRegex" placeholder="Search users by IP address" ng-keydown="$event.which === 13 && AdminManagementCtrl.searchUsers()" ng-keyup="$event.which === 27 && AdminManagementCtrl.clearSearch()" />
        </div>
      </div>
    </div>
    <div class="fill-row centered-text" v-if="!query?.search && count < 1">
      <h4>No Users to display in <strong>{{query?.filter ? 'Banned' : 'All'}}</strong></h4>
    </div>
    <div class="fill-row" v-if="count > 0 || query?.search">
      <div v-if="query.search">
      Displaying {{count}} search result(s) for "<strong>{{search}}</strong>" in <strong>{{query?.filter ? 'Banned': 'All'}}</strong>:<br /><br />
      </div>
      <table class="underlined" width="100%">
        <thead>
          <th class="pointer" ng-click="AdminManagementCtrl.setSortField('username')"><span ng-class="AdminManagementCtrl.getSortClass('username')"></span>&nbsp;Username</th>
          <th class="pointer" ng-class="{'hide-mobile': AdminManagementCtrl.tableFilter == 1 }" ng-click="AdminManagementCtrl.setSortField('email')"><span ng-class="AdminManagementCtrl.getSortClass('email')"></span>&nbsp;Email</th>
          <th class="pointer" ng-show="AdminManagementCtrl.tableFilter == 1" ng-click="AdminManagementCtrl.setSortField('ban_expiration')"><span ng-class="AdminManagementCtrl.getSortClass('ban_expiration')"></span>&nbsp;Ban Expiration</th>
          <th class="pointer hide-mobile" ng-click="AdminManagementCtrl.setSortField('created_at')"><span ng-class="AdminManagementCtrl.getSortClass('created_at')"></span>&nbsp;Registered Date</th>
          <th class="hide-mobile">Last Active Date</th>
          <th class="hide-mobile">IP Addresses</th>
          <th class="user-actions">Actions</th>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.username">
            <td><a ui-sref="profile.posts({ username: user.username })" ng-bind="user.username"></a>
            <i ng-show="user.ban_expiration" class="fa fa-user-times right"></i>
            </td>
            <td class="email-column" ng-class="{'hide-mobile': AdminManagementCtrl.tableFilter == 1 }"><a ng-href="mailto:{{user.email}}" ng-bind="user.email"></a></td>
            <td ng-show="AdminManagementCtrl.tableFilter == 1" ng-bind="user.ban_expiration | humanDate:true"></td>
            <td class="hide-mobile" ng-bind="user.created_at | humanDate"></td>
            <td class="hide-mobile" ng-bind="(user.last_active | humanDate) || '--'"></td>
            <td class="hide-mobile">
              <span ng-repeat="ip in user.user_ips track by $index">
                <span ng-bind="ip"></span>{{ !$last ? ', ' : '' }}
              </span>
              <span ng-if="!user.user_ips.length">Not Available</span>
            </td>
            <td class=user-actions>
              <a ui-sref="users-posts({ username: user.username })">
                <button class="icon" data-balloon="View Posts">
                  <i class="fa fa-file-text-o"></i>
                </button>
              </a>

              <button class="icon" data-balloon="Edit Profile" ng-click="AdminManagementCtrl.showEditUser(user.username)">
                <i class="fa fa-pencil"></i>
              </button>

              <button class="icon" data-balloon="Manage Bans" ng-click="AdminManagementCtrl.showManageBans(user)" ng-disabled="!AdminManagementCtrl.actionAccess.userControls.privilegedBan">
                <i class="fa fa-ban"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination-wrap">
        <!-- <pagination page-count="AdminManagementCtrl.pageCount" page="AdminManagementCtrl.page" query-params="AdminManagementCtrl.queryParams"></pagination> -->
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted } from 'vue'
import { usersApi } from '@/api'
import EventBus from '@/composables/services/event-bus'

export default {
  name: 'UserManagement',
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
      .then(count => next(vm => {
        vm.query = queryParams
        vm.users = users
        vm.count = count
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
      .then(count => {
        this.query = queryParams
        this.users = users
        this.count = count
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

    const setFilter = () => {}
    const clearSearch = () => {}
    const searchUsers = () => {}

    const v = reactive({
      users: {},
      count: 0,
      query: {},
      searchStr: ''
    })
    return { ...toRefs(v), setFilter, clearSearch, searchUsers }
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
</style>
