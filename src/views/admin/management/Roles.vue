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
        <div class="role-table-header">
          <span></span>
          <span>Role Name</span>
          <span>Description</span>
          <span>Actions</span>
        </div>
      </template>
      <template #item="{element}">
        <div :class="{ 'selected-row' : selectedRole.id === element.id }" class="role-table-row pointer" @click="selectRole(element)">
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
  </div>

  <div v-if="selectedRole.id && !selectedRole.message">
    <h3 class="role-header">{{selectedRole.name}} ({{userData.count}} users)</h3>
    <div class="add-users">
      <a href="#" v-if="userData.count > 0" @click.prevent="showFilterUsers = !showFilterUsers">
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
      <Multiselect v-model="usersToAdd.value" v-bind="usersToAdd" />
      <div class="button-container">
        <button @click="usersToAdd.value = []" :disabled="usersToAdd.value.length < 1">Clear</button>
        <button @click="addUsers()" :disabled="usersToAdd.value.length < 1">Add User(s)</button>
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
      <br />
      <h5>
        This role has no users to display. {{ selectedRole.lookup === 'banned' ? '' : 'To add users to this role click use the form above.' }}
        <span v-if="selectedRole.lookup !== 'banned'">
          To add users to this role click use the form above.
        </span>
        <span v-if="selectedRole.lookup === 'banned'">
          Visit the <router-link :to="{ name: 'UserManagement' }">Users Tab</router-link> to ban users
        </span>
      </h5>
    </div>
  </div>

  <div v-if="selectedRole.id && selectedRole.message">
    <br />
    <h3>{{selectedRole.name}}</h3> <br />
    <h5>{{selectedRole.message}}</h5>
  </div>

  <div v-if="!selectedRole.id">
    <span></span>
  </div>


</template>

<script>
import { useRoute, useRouter } from 'vue-router'
import { reactive, toRefs, inject, onMounted, onUnmounted } from 'vue'
import { adminApi, usersApi } from '@/api'
import { AuthStore } from '@/composables/stores/auth'
import draggable from 'vuedraggable'
import { intersection } from 'lodash'
import Multiselect from '@vueform/multiselect'
import EventBus from '@/composables/services/event-bus'

export default {
  name: 'RoleManagement',
  components: { draggable, Multiselect },
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
        vm.init(to.query.roleId)
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
        this.init(to.query.roleId)
        next()
      })
    })
  },
  setup() {
    onMounted(() => {
      EventBus.on('admin-save', savePriority)
      EventBus.on('admin-reset', resetPriority)
    })
    onUnmounted(() => {
      EventBus.off('admin-save', savePriority)
      EventBus.off('admin-reset', resetPriority)
    })
    const savePriority = () => adminApi.roles.reprioritize(v.roles)
      .then(() => {
        $alertStore.success('Roles successfully reprioritized!')
        v.rolesCopy = [...v.roles]
      })
      .catch(() => $alertStore.error('There was an error reprioritizing the roles'))

    const resetPriority = () => v.roles = [...v.rolesCopy]

    const reprioritizeRoles = () => {
      if (v.controlAccess.reprioritize) {
        let priority = 0
        v.roles.forEach(r => r.priority = priority++)
      }
      else resetPriority()
    }
    const showRole = () => {}
    const selectRole = r => {
      let query = { ...$route.query, roleId: r.id }
      if (r.id === $route.query.roleId) delete query.roleId
      $router.replace({
        name: $route.name,
        params: { ...$route.params, saveScrollPos: true },
        query: query
      })
    }
    const showRemoveRole = () => {}
    const showResetRole = () => {}

    const searchUsers = () => {}
    const clearSearch = () => {}
    const addUsers = () => {}
    const removeUser = () => {}
    const canViewAddUsersControl = () => true

    const $auth = inject(AuthStore)
    const $alertStore = inject('$alertStore')
    const $route = useRoute()
    const $router = useRouter()

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
      usersToAdd: {
        mode: 'tags',
        value: [],
        placeholder: 'Type username of user(s) to add',
        noOptionsText: 'Enter a username to start lookup...',
        minChars: 1,
        resolveOnLoad: false,
        delay: 0,
        searchable: true,
        maxHeight: 100,
        options: async q => {
          return await usersApi.search(q)
          // convert array into array of objects
          .then(d => d.reduce((o, k) => (o[k] = k, o), {}))
        }
      },
      maxPriority: null,
      showFilterUsers: false,
      newRole: {},
      search: '',
      searchStr: '',
      allPriorities: [],
      userData: [],
      roles: [],
      rolesCopy: [],
      roleLayouts: [],
      selectedRole: {}
    })

    const init = function(roleId) {
      v.selectedRole = roleId ? v.roles.filter(r => r.id === roleId)[0] : {}

      v.roles.forEach(r => { // remove private and anoymous priorities
        if (r.lookup !== 'private' && r.lookup !== 'anonymous')
          v.allPriorities.push(r.priority)

        if (!v.maxPriority) v.maxPriority = r.priority;
        else v.maxPriority = v.maxPriority < r.priority ? r.priority : v.maxPriority

        if (r.lookup === 'user') {
          r.message = 'The ' + r.name + ' role is assigned by default.  By default all new registered users are considered users.  The userbase of this role may not be manually edited.  Permission changes to this role will affect all users without another role assigned.';
        }
        if (r.lookup === 'anonymous') {
          r.message = 'The ' + r.name + ' role is assigned by default to forum visitors who are not authenticated.  The user base of this role may not be manually edited.  Permission changes to this role will affect all unauthenticated users visiting the forum.';
        }
        if (r.lookup === 'private') {
          r.message = 'The ' + r.name + ' role is assigned by default to forum visitors who are not authenticated.  This role is only used if the "Public Forum" is set to off via the forum settings page.  This requires all visitors to log in before they can view the forum content.  The user base of this role may not be manually edited.  Permission changes to this role will affect all unauthenticated users visiting the forum.';
        }

        // Invert Priority Restrictions
        r.permissions.invertedRestrictions = v.allPriorities
        if (r.permissions.priorityRestrictions && r.permissions.priorityRestrictions.length) {
          r.permissions.invertedRestrictions = intersection(v.allPriorities, r.permissions.priorityRestrictions)
        }
      })
    }

    return { ...toRefs(v), reprioritizeRoles, selectRole, showRole, showRemoveRole, showResetRole, savePriority, resetPriority, searchUsers, clearSearch, addUsers, removeUser, canViewAddUsersControl, init }
  }
}
</script>

<style lang="scss" scoped>
  .role-header { display: inline-block; }
  .roles.user-search, .roles.add-role { width: 100%; }
  .add-users { float: right;  line-height: 1.5rem; }
  .button-container {
    margin-top: 1rem;
    display: grid;
    grid-column-gap: .5rem;
    grid-template-columns: 1fr 1fr;
  }
  .role-table-header {
    font-size: 0.75rem;
    border-bottom: 1px solid $border-color-alt;
    font-weight: 400;
    color: $secondary-font-color;
  }
  .role-table-row {
    font-size: 0.875rem;
    padding: .5rem 0;
    background-color: $base-background-color;
    border-bottom: 1px solid $border-color-alt;
  }
  .selected-row {
    background-color: $color-primary;
    color: $base-background-color;
    a { color: $base-background-color; }
  }
  .role-table-header, .role-table-row {
    display: grid;
    grid-template-columns: 2rem 10rem 1fr 6rem;
  }
  .actions { padding-top: 1rem; }
  .actions div:last-child { margin-right: .5rem; }
</style>
