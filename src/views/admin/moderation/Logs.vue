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

    <div class="logs-content fill-row" >
      <table class="underlined" width="100%">
        <thead>
          <th>Date</th>
          <th>Mod Username</th>
          <th>Mod Action</th>
          <th>Link</th>
          <th>Raw</th>
        </thead>
        <tbody v-if="logData?.data?.length">
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
      <div class="fill-row centered-text" v-if="!logData?.data?.length">
        <h4>No logs to display</h4>
      </div>
      <div class="pagination-wrap" v-if="logData?.page > 1 || logData.next">
        <div class="pagination-simple">
          <button @click="pageResults(logData.prev)" :disabled="!logData.prev">&#10094; Prev</button>
          <button @click="pageResults(logData.next)" :disabled="!logData.next">Next &#10095;</button>
        </div>
      </div>
    </div>
  </div>

  <modal :name="$options.name" :show="showRawObjectModal" @close="showRawObjectModal=false;selectedLog=null">
    <template v-slot:header>
      Raw Log Object
    </template>

    <template v-slot:body>
      <pre class="json" v-html="syntaxHighlight(selectedLog)"></pre>
    </template>
  </modal>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminApi } from '@/api'
import humanDate from '@/composables/filters/humanDate'
import dayjs from 'dayjs'
import Modal from '@/components/layout/Modal.vue'

export default {
  name: 'LogModeration',
  components: { Modal },
  beforeRouteEnter(to, from, next) {
    let queryParams = {
      limit: Number(to.query.limit) || undefined,
      page: Number(to.query.page) || undefined,
      mod: to.query.mod,
      action: to.query.action,
      keyword: to.query.keyword,
      bdate: to.query.bdate ? dayjs.utc(to.query.bdate).format('YYYY-MM-DD') : undefined,
      adate: to.query.adate ?  dayjs.utc(to.query.adate).format('YYYY-MM-DD') : undefined,
      sdate: to.query.sdate ?  dayjs.utc(to.query.sdate).format('YYYY-MM-DD') : undefined,
      edate: to.query.edate ?  dayjs.utc(to.query.edate).format('YYYY-MM-DD') : undefined
    }
    adminApi.logs.page(queryParams).then(data => next(vm => {
      vm.logData = data
      vm.init(queryParams)
    }))
  },
  beforeRouteUpdate(to, from, next) {
    let queryParams = {
      limit: Number(to.query.limit) || undefined,
      page: Number(to.query.page) || undefined,
      mod: to.query.mod,
      action: to.query.action,
      keyword: to.query.keyword,
      bdate: to.query.bdate ?  dayjs.utc(to.query.bdate).format('YYYY-MM-DD') : undefined,
      adate: to.query.adate ?  dayjs.utc(to.query.adate).format('YYYY-MM-DD') : undefined,
      sdate: to.query.sdate ?  dayjs.utc(to.query.sdate).format('YYYY-MM-DD') : undefined,
      edate: to.query.edate ?  dayjs.utc(to.query.edate).format('YYYY-MM-DD') : undefined
    }
    adminApi.logs.page(queryParams).then(data => {
      this.logData = data
      this.init(queryParams)
      next()
    })
  },
  setup() {
    const pageResults = page => {
      let query = { ...$route.query, page: page }
      if (query.page <= 1 || !query.page) delete query.page
      $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const filterResults = () => {
      let query = { ...$route.query, ...v.filter }
      query = {
        ...query,
        bdate: query.bdate ? new Date(query.bdate) : undefined,
        adate: query.adate ? new Date(query.adate) : undefined,
        sdate: query.sdate ? new Date(query.sdate) : undefined,
        edate: query.edate ? new Date(query.edate) : undefined
      }
      Object.keys(query).forEach(k => { if (!query[k]) delete query[k] })
      $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const clearFilter = () => $router.replace({ name: $route.name, params: $route.params })

    const showRawObject = log => {
      v.selectedLog = Object.assign({}, log)
      delete v.selectedLog.action_display_text
      delete v.selectedLog.action_display_url
      v.showRawObjectModal = true
    }

    const syntaxHighlight = json => {
      if (typeof json !== 'string') json = JSON.stringify(json, undefined, 2)
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, match => {
        let cls = 'number'
        if (/^"/.test(match)) {
          if (/:$/.test(match)) cls = 'key'
          else cls = 'string'
        }
        else if (/true|false/.test(match)) cls = 'boolean'
        else if (/null/.test(match)) cls = 'null'
        return `<span class="${cls}">${match}</span>`
      })
    }

    const disableFilter = () => {
      return (!v.filter.mod && !v.filter.action && !v.filter.keyword && !v.filter.bdate && !v.filter.adate && !v.filter.sdate && !v.filter.edate) ||
        (v.selectedDateFilterType === 'before' && !v.filter.bdate) ||
        (v.selectedDateFilterType === 'after' && !v.filter.adate) ||
        (v.selectedDateFilterType === 'between' && (!v.filter.sdate || !v.filter.edate))
    }

    const disableClear = () => {
      let query = $route.query
      return !(query.mod || query.action || query.keyword || query.bdate || query.adate || query.sdate || query.edate)
    }

    const init = query => {
      v.filter = { ...query }
      delete v.filter.page
      delete v.filter.limit
      if (!v.filter.action) v.filter.action = null
      if (query.bdate) v.selectedDateFilterType = 'before'
      else if (query.adate) v.selectedDateFilterType = 'after'
      else if (query.sdate && query.edate) v.selectedDateFilterType = 'between'
      else v.selectedDateFilterType = null
    }

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
      filter: {},
      selectedLog: null,
      selectedDateFilterType: null,
      showRawObjectModal: false
    })
    return { ...toRefs(v), init, humanDate, dateFilterTypes, actionTypes, filterResults, clearFilter, disableClear, disableFilter, showRawObject, pageResults, syntaxHighlight }
  }
}
</script>

<style lang="scss" scoped>
.admin.admin-table-header { padding-bottom: 0rem; }
.log-filter {
  span { display: inline-block; margin-bottom: 0.5rem; }
  input, select { margin: 0; height: 2rem; line-height: 1rem; padding: 0 0.25rem; width: auto; display: inline-block; }
  select { padding-right: 1.5rem; height: 2.3125rem; }
  button, button:focus {
    display: inline-block;
    margin-right: 0.2rem;
    padding: 0 1.8rem;
    line-height: 2rem;
    height: 2rem;
  }
  span { margin-right: 0.2rem; }
}
.logs-content { margin-top: 6rem; }
</style>
