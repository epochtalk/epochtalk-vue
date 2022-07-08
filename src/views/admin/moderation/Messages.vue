<template>
  <div class="full-width">
    <div class="admin-table-header row">
      <div class="column">
        <div class="row">
          <div class="moderation-messages radio-button column">
            <input type="radio" class="hide-radio" name="table-filter" :value="undefined" id="report-filter-0" v-model="query.filter" @click="setFilter()" />
            <label for="report-filter-0">All</label>
          </div>
          <div class="moderation-messages radio-button column">
            <input type="radio" class="hide-radio" name="table-filter" :value="'pending'" id="report-filter-1" v-model="query.filter" @click="setFilter('pending')" />
            <label for="report-filter-1">Pending</label>
          </div>
          <div class="moderation-messages radio-button column">
            <input type="radio" class="hide-radio" name="table-filter" :value="'reviewed'" id="report-filter-2" v-model="query.filter" @click="setFilter('reviewed')" />
            <label for="report-filter-2">Reviewed</label>
          </div>
          <div class="moderation-messages radio-button column">
            <input type="radio" class="hide-radio" name="table-filter" :value="'ignored'" id="report-filter-3" v-model="query.filter" @click="setFilter('ignored')" />
            <label for="report-filter-3">Ignored</label>
          </div>
          <div class="moderation-messages radio-button column">
            <input type="radio" class="hide-radio" name="table-filter" :value="'badReport'" id="report-filter-4" v-model="query.filter" @click="setFilter('badReport')" />
            <label for="report-filter-4">Bad Report</label>
          </div>
        </div>
      </div>
      <div class="report-search column">
        <div class="nested-input-container" v-if="!query?.ip">
          <a v-if="query?.search" @click="clearSearch()" class="nested-clear-btn fa fa-times"></a>
          <a @click="searchReports()" class="nested-btn">Search</a>
          <input class="input-text nested-input" v-model="searchStr" type="text" id="search-reports" placeholder="Search reported messages" @keydown="$event.which === 13 && searchReports()" @keyup="$event.which === 27 && clearSearch()" />
        </div>
      </div>
    </div>
    <div class="report-content fill-row centered-text" v-if="!query?.search && reportData?.count < 1">
      <h4>No Messages to display in <strong>{{query?.filter}}</strong></h4>
    </div>
    <div class="report-content fill-row" v-if="reportData?.count > 0 || query?.search">
      <div v-if="query?.search">
      Displaying {{reportData?.count}} search result(s) for "<strong>{{query?.search}}</strong>" in <strong>{{query?.filter}}</strong>:<br /><br />
      </div>
      <table class="underlined" width="100%">
        <thead>
          <th class="pointer hide-mobile" @click="setSortField('reporter_username')"><span :class="getSortClass('reporter_username')"></span>&nbsp;Reported By</th>
          <th class="pointer" @click="setSortField('created_at')"><span :class="getSortClass('created_at')"></span>&nbsp;Reported Date</th>
          <th class="pointer" @click="setSortField('status')"><span :class="getSortClass('status')"></span>&nbsp;Status</th>
          <th class="pointer hide-mobile" @click="setSortField('offender_created_at')"><span :class="getSortClass('offender_created_at')"></span>&nbsp;Sent Date</th>
          <th class="pointer" @click="setSortField('offender_author_username')"><span :class="getSortClass('offender_author_username')"></span>&nbsp;Author</th>
          <th class="reason">Reason</th>
          <th class="user-actions">Actions</th>
        </thead>
        <tbody>
          <tr v-for="report in reportData.data" :key="report.id">
            <td class="hide-mobile">
              <router-link :to="{ path: '/profile/' + report.reporter_username.toLowerCase() }" v-html="report.reporter_username" />
            </td>
            <td>{{humanDate(report.created_at, true)}}</td>
            <td v-html="report.status"></td>
            <td class="hide-mobile">{{humanDate(report.offender_created_at, true)}}</td>
            <td>
              <router-link :to="{ path: '/profile/' + report.offender_author_username.toLowerCase() }" v-html="report.offender_author_username" />
              &nbsp;&nbsp;&nbsp;<i v-if="report.offender_ban_expiration || report.offender_board_banned" class="fa fa-user-times"></i>
            </td>
            <td class="hide-mobile">{{report.reporter_reason}}</td>
            <td class=actions>
              <button class="icon" data-balloon="Modify Report Status">
                <i class="fas fa-cog"></i>
              </button>

              <button class="icon" data-balloon="Warn User" @click="editUser(user)">
                <i class="fas fa-exclamation-circle"></i>
              </button>

              <button class="icon" data-balloon="Manage Bans">
                <i class="fa fa-ban"></i>
              </button>
            </td>

<!--           <td class="mod-actions">
            <button class="icon" data-balloon="Modify Report Status" ng-click="ModerationCtrl.showSetStatus(messageReport)" ng-disabled="!ModerationCtrl.canUpdateUserReport()"><i class="fa fa-cog"></i></button>

            <button class="icon" data-balloon="Warn User" ng-click="ModerationCtrl.showWarn({ id: messageReport.offender_author_id, username: messageReport.offender_author_username })" ng-disabled="!ModerationCtrl.canCreateConversation()"><i class="fa fa-exclamation-circle"></i></button>

            <button class="icon" data-balloon="Manage Bans" ng-click="ModerationCtrl.showManageBans({ id: messageReport.offender_author_id, username: messageReport.offender_author_username, email: messageReport.offender_author_email, created_at: messageReport.offender_author_created_at, ban_expiration: messageReport.offender_ban_expiration })" ng-disabled="!ModerationCtrl.canBanUser()"><i class="fa fa-ban"></i></button>
          </td> -->


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
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminApi } from '@/api'
import SimplePagination from '@/components/layout/SimplePagination.vue'
import humanDate from '@/composables/filters/humanDate'

export default {
  name: 'MessageModeration',
  components: { SimplePagination },
  beforeRouteEnter(to, from, next) {
    let queryParams = {
      limit: Number(to.query.limit) || undefined,
      page: Number(to.query.page) || undefined,
      filter: to.query.filter,
      field: to.query.field,
      desc: to.query.desc,
      search: to.query.search
    }
    adminApi.reports.pageReportedMessages(queryParams).then(data => next(vm => {
      vm.reportData = data
      vm.query = queryParams
    }))
  },
  beforeRouteUpdate(to, from, next) {
    let queryParams = {
      limit: Number(to.query.limit) || undefined,
      page: Number(to.query.page) || undefined,
      filter: to.query.filter,
      field: to.query.field,
      desc: to.query.desc,
      search: to.query.search
    }
    adminApi.reports.pageReportedMessages(queryParams).then(data => {
      this.reportData = data
      this.query = queryParams
      next()
    })
  },
  setup() {
    const setFilter = () => console.log('setFilter')
    const clearSearch = () => console.log('clearSearch')
    const searchReports = () => console.log('searchReports')

    const setSortField = newField => {
      // Get/Set new sort field
      if (newField) v.sortField = newField
      else newField = v.sortField
      // Convert desc query param to boolean
      let desc = $route.query.desc === 'false' || !$route.query.desc ? false : true
      // Sort Field hasn't changed just toggle desc
      const defaultField = newField === 'created_at' && !$route.query.field
      if (defaultField || newField === $route.query.field) desc = !desc
      else desc = true // Sort field changed, default to desc true
      // Update router to have new query params, watch on query params will update data
      let query = { limit: $route.query.limit, field: newField, filter: $route.query.filter, page: $route.query.page, search: v.searchStr, ip: $route.query.ip }
      if (!query.page) delete query.page // don't include page if undefined
      if (newField === 'created_at') delete query.field // do not display default field in qs
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

    const $route = useRoute()
    const $router = useRouter()

    const v = reactive({
      config: {},
      query: {},
      reportData: {},
      searchStr: null
    })

    return { ...toRefs(v), setFilter, searchReports, clearSearch, setSortField, getSortClass, humanDate }
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
  padding-bottom: 2rem;
  top: 0.4rem;
  .nested-input { margin-bottom: 0; }
  .radio-button label {
    text-align: center;
    height: 2.25rem;
    border-radius: 3px;
  }
  @include break-mobile-sm { padding: 1.25rem 1rem 0; margin: 0 -1rem 2rem; }
}
.row {
  display: flex;
  flex-flow: row;
  row-gap: 0;
}
.column { flex: 50%;}

table.underlined {
  border: none;
  margin-bottom: 1rem;
  margin-top: 6rem;
  thead {
    text-align: left;
    font-size: 0.875rem;
    background-color: transparent;
    border-bottom: $border-alt;
    th { color: $secondary-font-color; font-weight: 400; padding-bottom: 0.5rem; padding-left: 0.5rem; }
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

  .actions {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
