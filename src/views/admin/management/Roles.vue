<template>
  <div>
    <h3>Create and Edit Roles
      <span class="info-tooltip" data-balloon="Add new roles or customize existing roles by editing below. Drag and drop the roles below to order by priority. The lower the number, the higher the priority of the role. This allows for roles of a higher priority to take action upon those of lower priority." data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
    </h3><br />
    <div v-if="controlAccess?.add?.allow" class="roles add-role">
      <div class="nested-input-container">
        <a @click.prevent="showRole()" class="pointer nested-btn">Add</a>
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
            <a href="#" v-if="controlAccess?.update?.allow" @click.stop.prevent="showRole(element)">Edit</a>
            <span v-if="!controlAccess?.update?.allow">Edit</span>
            &nbsp;&nbsp;
            <a v-if="element.id === element.lookup && controlAccess?.remove?.allow" href="#" @click.stop.prevent="showRemoveRole(element)">Remove</a>
            <a v-if="element.id !== element.lookup" href="#" @click.stop.prevent="showResetRole(element)">Reset</a>
          </span>
        </div>
      </template>
      <template #footer>
        <div class="actions">
          <div v-if="controlAccess?.reprioritize?.allow" class="right"><button @click="resetPriority()">Reset Priority</button></div>
          <div v-if="controlAccess?.reprioritize?.allow" class="right"><button @click="savePriority()">Save Priority</button>&nbsp;&nbsp;&nbsp;</div>
        </div>
      </template>
    </draggable>
  </div>

  <div v-if="selectedRole.id && !selectedRole.message">
    <h3 class="role-header">{{selectedRole?.name}} ({{userData?.count}} users)</h3>
    <div class="add-users">
      <a href="#" v-if="userData.count > 0 || (!userData.count && searchStr?.length)" @click.prevent="showFilterUsers = !showFilterUsers">
        <i class="fa fa-search"></i> Filter Users
      </a>
    </div>
    <br /><br />
    <div v-if="userData.count > 0 || (!userData.count && searchStr?.length)">
      <div v-if="showFilterUsers" class="roles user-search">
        <div class="nested-input-container">
          <a v-if="searchStr" @click="clearSearch()" class="nested-clear-btn fa fa-times"></a>
          <a @click="searchUsers()" class="nested-btn">Search</a>
          <input class="nested-input" v-model="searchStr" type="text" id="search-users" placeholder="Search users by username" @keydown="$event.which === 13 && searchUsers()" @keyup="$event.which === 27 && clearSearch()" />
        </div>
      </div>
      <div class="clear"></div>
    </div>
    <div v-if="canViewAddUsersControl()">
      <multiselect v-model="usersToAdd.value" v-bind="usersToAdd" />
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
        <simple-pagination
          v-model="currentPage"
          :pages="pages"
          :range-size="1"
          @update:modelValue="pageResults"
        />
      </div>
    </div>
    <div v-if="userData.count < 1">
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
    <h3>{{selectedRole.name}}</h3> <br />
    <h5>{{selectedRole.message}}</h5>
  </div>

  <div v-if="!selectedRole.id">
    <span></span>
  </div>

  <role-manager-modal :show="addNewRole || editSelectedRole || resetSelectedRole || removeSelectedRole" :add="addNewRole" :edit="editSelectedRole" :reset="resetSelectedRole" :remove="removeSelectedRole" @close="addNewRole=editSelectedRole=resetSelectedRole=removeSelectedRole=false" :roles="roles" :layouts="roleLayouts" :selected="modifiedRole" :all-priorities="allPriorities" @success="refreshPageData" />
</template>

<script>
import { useRoute, useRouter } from 'vue-router'
import { reactive, toRefs, inject, onMounted, onUnmounted, computed } from 'vue'
import { adminApi, usersApi } from '@/api'
import { AuthStore } from '@/composables/stores/auth'
import draggable from 'vuedraggable'
import { intersection } from 'lodash'
import Multiselect from '@vueform/multiselect'
import EventBus from '@/composables/services/event-bus'
import SimplePagination from '@/components/layout/SimplePagination.vue'
import RoleManagerModal from '@/components/modals/admin/management/RoleManager.vue'

export default {
  name: 'RoleManagement',
  components: { draggable, Multiselect, SimplePagination, RoleManagerModal },
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
        vm.pages = computed(() => Math.ceil(d.count  / queryParams.limit))
        vm.searchStr = to.query.search
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
        this.pages = computed(() => Math.ceil(d.count  / queryParams.limit))
        this.searchStr = to.query.search
        this.init(to.query.roleId)
        next()
      })
    })
  },
  setup() {
    const refreshPageData = () => {
      let queryParams = {
        limit: Number($route.query.limit) || 15,
        page: Number($route.query.page) || 1,
        search: $route.query.search
      }
      adminApi.roles.all()
      .then(r => {
        let promise = $route.query.roleId ?
          adminApi.roles.users($route.query.roleId, queryParams) : Promise.resolve()
        promise.then(d => {
          v.roles = r.roles
          v.rolesCopy = r.roles
          v.roleLayouts = r.layouts
          v.userData = d || []
          v.pages = computed(() => Math.ceil(d.count  / queryParams.limit))
          v.searchStr = $route.query.search
          init($route.query.roleId)
        })
      })
    }

    const pageResults = page => {
      let query = { ...$route.query, page: page }
      if (query.page === 1 || !query.page) delete query.page
      if ($route.query.page !== v.currentPage) $router.replace({
          name: $route.name,
          params: { ...$route.params, saveScrollPos: true },
          query: query
        })
    }

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

    const selectRole = r => {
      let query = { ...$route.query, roleId: r.id }
      if (r.id === $route.query.roleId) delete query.roleId
      $router.replace({
        name: $route.name,
        params: { ...$route.params, saveScrollPos: true },
        query: query
      })
    }

    const showRole = role => {
      v.modifiedRole = role || v.newRole
      if (role) v.editSelectedRole = true
      else {
        v.modifiedRole.priority = v.maxPriority + 1
        v.addNewRole = true
      }
    }
    const showRemoveRole = role => {
      v.modifiedRole = role
      v.removeSelectedRole = true
    }

    const showResetRole = role => {
      v.modifiedRole = role
      v.resetSelectedRole = true
    }

    const searchUsers = () => {
      if (!v.searchStr || v.searchStr && !v.searchStr.length) {
        clearSearch()
        return
      }
      let query = { ...$route.query, search: v.searchStr }
      if (query.page === 1 || !query.page) delete query.page
      $router.replace({
        name: $route.name,
        params: { ...$route.params, saveScrollPos: true },
        query: query
      })
    }

    const clearSearch = () => {
      let query = { ...$route.query }
      delete query.search
      v.searchStr = null
      $router.replace({
        name: $route.name,
        params: { ...$route.params, saveScrollPos: true },
        query: query
      })
    }
    const addUsers = () => adminApi.roles.addUsers({
        usernames: v.usersToAdd.value,
        role_id: v.selectedRole.id
      })
      .then(() => {
        v.usersToAdd.value = []
        $alertStore.success(`Users successfully added to ${v.selectedRole.name} role.`)
        refreshPageData()
      })
      .catch(err => {
        let message = 'There was an error adding users to ' + v.selectedRole.name + ' role.'
        if (err && err.data && err.data.message) message = err.data.message
        $alertStore.error(message)
      })

    const removeUser = user => adminApi.roles.removeUser({
        user_id: user.id,
        role_id: v.selectedRole.id
      })
      .then(() => {
        $alertStore.success(`User ${user.username} successfully removed from ${v.selectedRole.name} role.`)
        refreshPageData()
      })
      .catch(err => {
        let message = 'There was an error removing ' + user.username + ' from ' + v.selectedRole.name + ' role.';
        if (err && err.data && err.data.message) message = err.data.message
        $alertStore.error(message)
      })

    const canViewAddUsersControl = () => {
      let view = false
      if (v.selectedRole.lookup !== 'banned') {
        if (v.controlAccess.privilegedAddRoles && v.controlAccess.privilegedAddRoles.samePriority)
          view = v.selectedRole.priority >= v.authedUser.permissions.priority
        else if (v.controlAccess.privilegedAddRoles && v.controlAccess.privilegedAddRoles.lowerPriority)
          view = v.selectedRole.priority > v.authedUser.permissions.priority
      }
      if (v.showFilterUsers) v.showFilterUsers = view
      return view
    }

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
      authedUser: $auth.user,
      currentPage: Number($route.query.page) || 1,
      pages: null,
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
      addNewRole: false,
      editSelectedRole: false,
      resetSelectedRole: false,
      removeSelectedRole: false,
      maxPriority: null,
      showFilterUsers: false,
      newRole: {},
      modifiedRole: {},
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
      v.showFilterUsers = !!v.searchStr
      if (v.userData && v.userData.users) {
        v.userData.users.forEach(user => {
          user.remove = false
          if (v.controlAccess.privilegedRemoveRoles && v.controlAccess.privilegedRemoveRoles.samePriority) {
            user.remove = user.priority >= v.authedUser.permissions.priority
          }
          else if (v.controlAccess.privilegedRemoveRoles && v.controlAccess.privilegedRemoveRoles.lowerPriority) {
            user.remove = user.priority > v.authedUser.permissions.priority
          }
        })
      }

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

    return { ...toRefs(v), pageResults, reprioritizeRoles, selectRole, showRole, showRemoveRole, showResetRole, savePriority, resetPriority, searchUsers, clearSearch, addUsers, removeUser, canViewAddUsersControl, init, refreshPageData }
  }
}
</script>

<style lang="scss" scoped>
  .underlined thead {
    text-align: left;
    border-bottom: 1px solid $border-color-alt;
    th { padding-left: .5rem; }
  }
  .pagination-wrap { margin-top: 1rem; }
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
