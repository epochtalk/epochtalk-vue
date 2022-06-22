<template>
  <div class="full-width">
    <div class="admin-table-header log-filter">
      <span>Show me</span>
      <span data-balloon="Mod Username, IP or ID">
        <input v-model="filter.mod" @keydown="$event.which === 13 && filterResults()" type="text" placeholder="Any Moderator"/>
      </span>

      <span>who</span>

      <span data-balloon="Mod Action Performed">
        <select @keydown="$event.which === 13 && filterResults()" v-model="filter.action" ng-options="action.value as action.desc group by action.group for action in ModerationCtrl.actionTypes">
          <option :value="null">Did Anything</option>
          <optgroup v-for="group in actionTypes" :label="group.groupName" :key="group.groupName">
            <option v-for="action in group.actions" :value="action.value" :key="action.desc">{{action.desc}}</option>
          </optgroup>
        </select>
      </span>

      <span>with</span>

      <span data-balloon="Mod Action Keyword">
        <input @keydown="$event.which === 13 && filterResults()" type="text" v-model="filter.keyword" placeholder="Keyword" />
      </span>
      <span data-balloon="Optional Date Range">
        <select v-model="selectedDateFilterType" @change="filter.bdate = undefined;filter.adate = undefined;filter.sdate = undefined;filter.edate = undefined">
          <option :value="null">At Anytime</option>
          <option :selected="selectedDateFilterType === v" v-for="(k, v) in dateFilterTypes" :key="k" :value="v" v-html="k"></option>
        </select>
      </span>

      <span v-show="selectedDateFilterType === 'after'" data-balloon="After Date">
        <input @keydown="$event.which === 13 && filterResults()" v-model="filter.adate" type="date" />
      </span>

      <span v-show="selectedDateFilterType === 'before'" data-balloon="Before Date">
        <input @keydown="$event.which === 13 && filterResults()" v-model="filter.bdate" type="date" />
      </span>

      <div class="inline-block" v-show="selectedDateFilterType === 'between'" >
        <span data-balloon="Start Date">
          <input v-model="filter.sdate" type="date" />
        </span>
        <span>and</span>
        <span data-balloon="End Date">
          <input @keydown="$event.which === 13 && filterResults()" v-model="filter.edate" type="date" />
        </span>
      </div>

      <button :disabled="disableFilter()" @click="filterResults()">Filter</button>
      <button :disabled="disableClear()" @click="clearFilter()">Clear</button>
    </div>
    <div class="logs-content fill-row centered-text" v-if="!logData">
      <h4>No logs to display</h4>
    </div>
    <div class="logs-content fill-row" v-if="logData">
      <table class="underlined" width="100%">
        <thead>
          <th>Date</th>
          <th>Mod Username</th>
          <th>Mod Action</th>
          <th>Link</th>
          <th>Raw</th>
        </thead>
        <tbody>
          <tr v-for="log in logData?.data" :key="log">
            <td v-html="humanDate(log.action_taken_at)"></td>
            <td>
              <router-link :to="{ path: '/profile/' + log.mod_username.toLowerCase() }" v-html="log.mod_username" />
            </td>
            <td v-html="log.action_display_text"></td>
            <td>
              <router-link v-if="log.action_display_url" :to="{ path: log.action_display_url }" target="_blank">
                <i class="fas fa-external-link-alt"></i>
              </router-link>
              <i v-if="!log.action_display_url" class="fas fa-external-link-alt"></i>
            </td>
            <td>
              <a class="pointer" @click="showRawObject(log)"><i class="fas fa-file-code"></i></a>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination-wrap" v-if="logData?.page > 1 || logData.next">
        <div class="pagination-simple">
          <button @click="pageResults(logData.prev)" :disabled="!logData.prev">&#10094; Prev</button>
          <button @click="pageResults(logData.next)" :disabled="!logData.next">Next &#10095;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminApi } from '@/api'
import humanDate from '@/composables/filters/humanDate'

export default {
  name: 'LogModeration',
  beforeRouteEnter(to, from, next) {
    let queryParams = {
      limit: Number(to.query.limit) || undefined,
      page: Number(to.query.page) || undefined
    }
    adminApi.logs.page(queryParams).then(data => next(vm => vm.logData = data))
  },
  beforeRouteUpdate(to, from, next) {
    let queryParams = {
      limit: Number(to.query.limit) || undefined,
      page: Number(to.query.page) || undefined
    }
    adminApi.logs.page(queryParams).then(data => {
      this.logData = data
      next()
    })
  },
  setup() {
    const pageResults = page => {
      let query = { ...$route.query, page: page }
      if (query.page <= 1 || !query.page) delete query.page
      $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const filterResults = () => console.log('filterResults')
    const clearFilter = () => console.log('clearFilter')
    const showRawObject = () => console.log('showRawObject')
    const disableFilter = () => false
    const disableClear = () => false

    const actionTypes = [
      {
        groupName: 'User Report Actions',
        actions: [
          { value: 'reports.updateUserReport',
            desc: 'Updated a User Report Status' },
          { value: 'reports.createUserReportNote',
            desc: 'Created a User Report Note' },
          { value: 'reports.updateUserReportNote',
            desc: 'Updated a User Report Note' }
        ]
      },
      {
        groupName: 'Post Report Actions',
        actions: [
          { value: 'reports.updatePostReport',
            desc: 'Updated a Post Report Status' },
          { value: 'reports.createPostReportNote',
            desc: 'Created a Post Report Note' },
          { value: 'reports.updatePostReportNote',
            desc: 'Updated a Post Report Note' }
        ]
      },
      {
        groupName: 'Message Report Actions',
        actions: [
          { value: 'reports.updateMessageReport',
            desc: 'Updated a Message Report Status' },
          { value: 'reports.createMessageReportNote',
            desc: 'Created a Message Report Note' },
          { value: 'reports.updateMessageReportNote',
            desc: 'Updated a Message Report Note' }
        ]
      },
      {
        groupName: 'Role Actions',
        actions: [
          { value: 'adminRoles.add',
            desc: 'Added a New Role' },
          { value: 'adminRoles.remove',
            desc: 'Removed a Role' },
          { value: 'adminRoles.update',
            desc: 'Updated a Role' },
          { value: 'adminRoles.reprioritize',
            desc: 'Reprioritized Roles' }
        ]
      },
      {
        groupName: 'Settings Actions',
        actions: [
          { value: 'adminSettings.update',
            desc: 'Updated Settings' },
          { value: 'adminSettings.addToBlacklist',
            desc: 'Added to IP Blacklist' },
          { value: 'adminSettings.updateBlacklist',
            desc: 'Updated a IP Blacklist Rule' },
          { value: 'adminSettings.deleteFromBlacklist',
            desc: 'Deleted a IP Blacklist Rule' },
          { value: 'adminSettings.setTheme',
            desc: 'Set the Forum Theme' },
          { value: 'adminSettings.resetTheme',
            desc: 'Reverted to the Default Forum Theme' }
        ]
      },
      {
        groupName: 'User Actions',
        actions: [
          { value: 'users.update',
            desc: 'Updated User' },
          { value: 'adminUsers.addRoles',
            desc: 'Added a Role to User' },
          { value: 'adminUsers.removeRoles',
            desc: 'Removed a Role from User' },
          { value: 'users.delete',
            desc: 'Deleted User' },
          { value: 'users.deactivate',
            desc: 'Deactivated User' },
          { value: 'users.reactivate',
            desc: 'Reactivated User' },
          { value: 'userNotes.create',
            desc: 'Created User Moderation Note' },
          { value: 'userNotes.update',
            desc: 'Updated User Moderation Note' },
          { value: 'userNotes.delete',
            desc: 'Deleted User Moderation Note' }
        ]
      },
      {
        groupName: 'Banning Actions',
        actions: [
          { value: 'bans.ban',
            desc: 'Banned User' },
          { value: 'bans.unban',
            desc: 'Unbanned User' },
          { value: 'bans.banFromBoards',
            desc: 'Banned User From Board(s)' },
          { value: 'bans.unbanFromBoards',
            desc: 'Unbanned User From Board(s)' },
          { value: 'bans.addAddresses',
            desc: 'Banned an Address' },
          { value: 'bans.editAddress',
            desc: 'Edited a Banned Address' },
          { value: 'bans.deleteAddress',
            desc: 'Deleted a Banned Address' }
        ]
      },
      {
        groupName: 'Board Actions',
        actions: [
          { value: 'adminBoards.updateCategories',
            desc: 'Updated Boards/Categories' },
          { value: 'adminModerators.add',
            desc: 'Added Moderator(s)' },
          { value: 'adminModerators.remove',
            desc: 'Removed Moderator(s)' },
          { value: 'boards.create',
            desc: 'Created Board' },
          { value: 'boards.update',
            desc: 'Updated Board' },
          { value: 'boards.delete',
            desc: 'Deleted Board' }
        ]
      },
      {
        groupName: 'Thread Actions',
        actions: [
          { value: 'threads.title',
            desc: 'Edited Thread Title' },
          { value: 'threads.sticky',
            desc: 'Stickied/Unstickied Thread' },
          { value: 'threads.lock',
            desc: 'Locked/Unlocked Thread' },
          { value: 'threads.move',
            desc: 'Moved Thread' },
          { value: 'threads.purge',
            desc: 'Purged Thread' },
          { value: 'threads.createPoll',
            desc: 'Created Thread Poll' },
          { value: 'threads.editPoll',
            desc: 'Edited Thread Poll' },
          { value: 'threads.lockPoll',
            desc: 'Locked Thread Poll' }
        ]
      },
      {
        groupName: 'Post Actions',
        actions: [
          { value: 'posts.update',
            desc: 'Edited User\'s Post' },
          { value: 'posts.delete',
            desc: 'Hid User\'s Post' },
          { value: 'posts.undelete',
            desc: 'Unhid User\'s Post' },
          { value: 'posts.purge',
            desc: 'Purged User\'s Post' }
        ]
      },
      {
        groupName: 'Messaging Actions',
        actions: [
         { value: 'conversations.delete',
           desc: 'Deleted Conversation' },
         { value: 'messages.delete',
           desc: 'Deleted Message' }
        ],
      }
    ]

    const dateFilterTypes = {
      between: 'Between',
      after: 'After',
      before: 'Before'
    }

    const $route = useRoute()
    const $router = useRouter()

    const v = reactive({
      logData: {},
      filter: {
        action: null
      },
      selectedDateFilterType: null
    })
    return { ...toRefs(v), humanDate, dateFilterTypes, actionTypes, filterResults, clearFilter, disableClear, disableFilter, showRawObject, pageResults }
  }
}
</script>

<style lang="scss">
.admin-table-header {
  background-color: $sub-header-color;
  position: absolute;
  left: 0;
  right: 0;
  padding: 2rem;
  padding-bottom: 1rem;
  top: 0.4rem;
  @include break-mobile-sm { padding: 1.25rem 1rem 0; margin: 0 -1rem 2rem; }
}
.log-filter {
  span { display: inline-block; margin-bottom: 0.5rem; }
  input, select { margin:0; height: 2rem; line-height: 1rem; padding: 0 0.25rem; width: auto; display: inline-block; }
  select { padding-right: 1.5rem; }
  button, button:focus {
    display: inline-block;
    margin-right: 0.2rem;
    padding: 0 1.8rem;
    line-height: 2rem;
    height: 2rem;
  }
  span { margin-right: 0.2rem; }
}
.logs-content {
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
  }
  tr {
    border-bottom: 1px solid $border-color-alt;
    vertical-align: top;
    &:nth-of-type(even) { background: transparent; }
    &:nth td { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    td {
      padding-top: 0.5rem;
      padding-right: 0.5rem;
      padding-bottom: 0.5rem;
      vertical-align: top;
      word-wrap: break-word;
      font-size: 0.75rem;
      line-height: 0.75rem;

      &:last-child {
        padding-right: 0;
      }
    }

    td input { margin-bottom: 0; }
  }
}
</style>
