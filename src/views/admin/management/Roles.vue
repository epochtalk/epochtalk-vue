<template>
  <div>
    <h3>Create and Edit Roles
      <span class="info-tooltip" data-balloon="Add new roles or customize existing roles by editing below. Drag and drop the roles below to order by priority. The lower the number, the higher the priority of the role. This allows for roles of a higher priority to take action upon those of lower priority." data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
    </h3><br />
    <div v-if="controlAccess.add.allow" class="roles add-role">
      <div class="nested-input-container">
        <a @click="showRole()" class="nested-btn">Add</a>
        <input class="nested-input" v-model="newRole.name" type="text" id="add-role" placeholder="Enter new role name" @keydown="$event.which === 13 && showRole()" />
      </div>
    </div>
      <draggable v-model="roles" @sort="reprioritizeRoles" item-key="id">
        <template #header>
          <div class="role-header">
            <span></span>
            <span>Role Name</span>
            <span>Description</span>
            <span>Actions</span>
          </div>
        </template>
        <template #item="{element}">
          <div class="role-row pointer" @click="selectRole(element)">
            <span class="centered-text"><i class="fa fa-align-justify" /></span>
            <span v-html="element.name"></span>
            <span v-html="element.description"></span>
            <span>
              <a href="#" v-if="controlAccess.update.allow" @click.prevent="showRole(element)">Edit</a>
              <span v-if="!controlAccess.update.allow">Edit</span>
              &nbsp;&nbsp;
              <a v-if="element.id === element.lookup && controlAccess.remove.allow" href="#" @click.prevent="showRemoveRole(element)">Remove</a>
              <a v-if="element.id !== element.lookup" href="#" @click.prevent="showResetRole(element)">Reset</a>
            </span>
          </div>
        </template>
        <template #footer>
          <div class="actions">
            <div v-if="controlAccess.reprioritize.allow" class="right"><button @click="resetPriority()">Reset Priority</button></div>
            <div v-if="controlAccess.reprioritize.allow" class="right"><button @click="savePriority()">Save Priority</button>&nbsp;&nbsp;&nbsp;</div>
          </div>
        </template>
      </draggable>
<!--     <table sv-root sv-on-sort="AdminManagementCtrl.reprioritizeRoles()" sv-part="AdminManagementCtrl.roles" width="100%" class="admin-content-selectable underlined">
      <thead>
        <th></th>
        <th>Role Name</th>
        <th>Description</th>
        <th>Actions</th>
      </thead>
      <tbody ng-repeat="role in AdminManagementCtrl.roles">
        <tr ng-class="{ 'active-row' : AdminManagementCtrl.selectedRole.id === role.id }" class="selectable-row pointer" ng-click="AdminManagementCtrl.selectRole(role)" sv-element>
          <td><i class="fa fa-align-justify" /></td>
          <td ng-bind-html="role.name"></td>
          <td ng-bind-html="role.description"></td>
          <td>
            <a ng-href="#" ng-if="AdminManagementCtrl.controlAccess.update.allow" ng-click="AdminManagementCtrl.showRole(role)">Edit</a>
            <span ng-if="!AdminManagementCtrl.controlAccess.update.allow">Edit</span>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <a ng-if="role.id === role.lookup && AdminManagementCtrl.controlAccess.remove.allow" ng-href="#" ng-click="AdminManagementCtrl.showRemoveRole(role)">Remove</a>
            <a ng-if="role.id !== role.lookup" ng-href="#" ng-click="AdminManagementCtrl.showResetRole(role)">Reset</a>
          </td>
        </tr>
      </tbody>
    </table> -->
  </div>

  <div v-if="selectedRole !== null && !selectedRole.message">
    <br />
    <h3 class="role-header">{{selectedRole.name}} ({{userData.count}} users)</h3>
    <div class="add-users">
      <a v-if="userData.count > 0" @click="showFilterUsers = !showFilterUsers">
        <i class="fa fa-search"></i> Filter Users
      </a>
    </div>
    <br /><br />
    <div v-if="userData.count > 0">
      <div v-if="showFilterUsers" class="roles user-search">
        <div class="nested-input-container">
          <a v-if="search" @click="clearSearch()" class="nested-clear-btn fa fa-times"></a>
          <a @click="searchUsers()" class="nested-btn">Search</a>
          <input class="nested-input" v-model="searchStr" type="text" id="search-users" placeholder="Search users by username" @keydown="$event.which === 13 && searchUsers()" @keyup="$event.which === 27 && clearSearch()" />
        </div>
      </div>
      <div class="clear"></div>
      <span v-if="selectedRole.lookup === 'banned'">
        Visit the <a ui-sref="^.users">Users Tab</a> to ban users
      </span>
    </div>
    <div v-if="canViewAddUsersControl()">
<!--       <tags-input min-length="1" placeholder="Type username to add" add-from-autocomplete-only="true" replace-spaces-with-dashes="false" ng-model="AdminManagementCtrl.usersToAdd">
        <auto-complete min-length="1" debounce-delay="250" source="AdminManagementCtrl.loadTags($query)"></auto-complete>
      </tags-input> -->
      <div class="button-container">
        <button class="half-button" @click="usersToAdd = null" :disabled="!usersToAdd || usersToAdd.length < 1">Clear</button>
        <button class="half-button" @click="addUsers()" :disabled="!usersToAdd || usersToAdd.length < 1">Add User(s)</button>
      </div>
    </div>
    <div v-if="userData.count > 0">
      <table class="underlined" width="100%">
        <thead>
          <th>Username</th>
          <th>Email</th>
          <th>Actions</th>
        </thead>
        <tbody v-for="user in userData.users" :key="user.id">
          <tr>
            <td><a ui-sref="profile.posts({ username: user.username })" v-html="user.username"></a></td>
            <td><a :href="`mailto:${user.email}`" v-html="user.email"></a></td>
            <td>
              <a v-if="user.remove" href="#" @click.prevent="removeUser(user)">Remove</a>
              <span v-if="!user.remove">Remove</span>
              &nbsp;&nbsp;&nbsp;&nbsp;
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination-wrap">
<!--         <pagination page-count="AdminManagementCtrl.pageCount" page="AdminManagementCtrl.page" query-params="AdminManagementCtrl.queryParams"></pagination> -->
      </div>
    </div>
    <div v-if="userData.count < 1">
      <h5>
        This role has no users to display. {{ selectedRole.lookup === 'banned' ? '' : 'To add users to this role click use the form above.' }}
        <span v-if="selectedRole.lookup !== 'banned'">
          To add users to this role click use the form above.
        </span>
        <span v-if="selectedRole.lookup === 'banned'">
          Visit the <a ui-sref="^.users">Users Tab</a> to ban users
        </span>
      </h5>
    </div>
  </div>

  <div v-if="selectedRole !== null && selectedRole.message">
    <br />
    <h3>{{selectedRole.name}}</h3> <br />
    <h5>{{selectedRole.message}}</h5>
  </div>

  <div v-if="selectedRole === null">
    <span></span>
  </div>


</template>

<script>
import { reactive, toRefs, inject } from 'vue'
import { adminApi } from '@/api'
import { AuthStore } from '@/composables/stores/auth'
import draggable from 'vuedraggable'

export default {
  name: 'RoleManagement',
  components: { draggable },
  beforeRouteEnter(to, from, next) {
    let queryParams = {
      limit: Number(to.query.limit) || 15,
      page: Number(to.query.page) || 1,
      search: to.query.search
    }
    adminApi.roles.all()
    .then(r => {
      let promise = to.query.roleId ?
        adminApi.roles.users(to.query.roleId, queryParams) : Promise.resolve()
      promise.then(d => next(vm => {
        vm.roles = r.roles
        vm.rolesCopy = r.roles
        vm.roleLayouts = r.layouts
        vm.userData = d || []
      }))
    })
  },
  beforeRouteUpdate(to, from, next) {
    let queryParams = {
      limit: Number(to.query.limit) || 15,
      page: Number(to.query.page) || 1,
      search: to.query.search
    }
    adminApi.roles.all()
    .then(r => {
      let promise = to.query.roleId ?
        adminApi.roles.users(to.query.roleId, queryParams) : Promise.resolve()
      promise.then(d => {
        this.roles = r.roles
        this.rolesCopy = r.roles
        this.roleLayouts = r.layouts
        this.userData = d || []
        next()
      })
    })
  },
  setup() {
    const reprioritizeRoles = () => {
      if (v.controlAccess.reprioritize) {
        let priority = 0
        v.roles.forEach(r => r.priority = priority++)
        console.log(v.roles)
      }
      else resetPriority()
    }
    const showRole = () => {}
    const selectRole = r => { console.log(r) }
    const showRemoveRole = () => {}
    const showResetRole = () => {}
    const savePriority = () => {}
    const resetPriority = () => v.roles = [...v.rolesCopy]
    const searchUsers = () => {}
    const clearSearch = () => {}
    const addUsers = () => {}
    const removeUser = () => {}
    const canViewAddUsersControl = () => true

    const $auth = inject(AuthStore)

    const v = reactive({
      controlAccess: {
        ...$auth.permissionUtils.getControlAccessWithPriority('roles'),
        privilegedRemoveRoles: {
          samePriority: $auth.permissionUtils.hasPermission('users.removeRole.bypass.priority.same'),
          lowerPriorty: $auth.permissionUtils.hasPermission('users.removeRole.bypass.priority.less')
        },
        privilegedAddRoles: {
          samePriority: $auth.permissionUtils.hasPermission('users.addRoles.bypass.priority.same'),
          lowerPriorty: $auth.permissionUtils.hasPermission('users.addRoles.bypass.priority.less')
        }
      },
      showFilterUsers: false,
      newRole: {},
      search: '',
      searchStr: '',
      usersToAdd: [],
      userData: [],
      roles: [],
      rolesCopy: [],
      roleLayouts: [],
      selectedRole: null
    })

    return { ...toRefs(v), reprioritizeRoles, selectRole, showRole, showRemoveRole, showResetRole, savePriority, resetPriority, searchUsers, clearSearch, addUsers, removeUser, canViewAddUsersControl }
  }
}
</script>

<style lang="scss" scoped>
  .role-header {
    font-size: 0.75rem;
    border-bottom: 1px solid $border-color-alt;
    font-weight: 400;
    color: $secondary-font-color;
  }
  .role-row {
    font-size: 0.875rem;
    padding: .5rem 0;
    border-bottom: 1px solid $border-color-alt;
  }
  .role-header, .role-row {
    display: grid;
    grid-template-columns: 2rem 10rem 1fr 6rem;
  }
  .actions { padding-top: 1rem; }
  .actions div:last-child { margin-right: .5rem; }
</style>
