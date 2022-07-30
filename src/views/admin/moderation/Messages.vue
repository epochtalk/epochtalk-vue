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
            <input type="radio" class="hide-radio" name="table-filter" :value="'Pending'" id="report-filter-1" v-model="query.filter" @click="setFilter('Pending')" />
            <label for="report-filter-1">Pending</label>
          </div>
          <div class="moderation-messages radio-button column">
            <input type="radio" class="hide-radio" name="table-filter" :value="'Reviewed'" id="report-filter-2" v-model="query.filter" @click="setFilter('Reviewed')" />
            <label for="report-filter-2">Reviewed</label>
          </div>
          <div class="moderation-messages radio-button column">
            <input type="radio" class="hide-radio" name="table-filter" :value="'Ignored'" id="report-filter-3" v-model="query.filter" @click="setFilter('Ignored')" />
            <label for="report-filter-3">Ignored</label>
          </div>
          <div class="moderation-messages radio-button column">
            <input type="radio" class="hide-radio" name="table-filter" :value="'Bad Report'" id="report-filter-4" v-model="query.filter" @click="setFilter('Bad Report')" />
            <label for="report-filter-4">Bad Report</label>
          </div>
        </div>
      </div>
      <div class="report-search column">
        <div class="nested-input-container">
          <a v-if="query?.search" @click="clearSearch()" class="nested-clear-btn fa fa-times"></a>
          <a @click="searchReports()" class="nested-btn">Search</a>
          <input class="input-text nested-input" v-model="searchStr" type="text" id="search-reports" placeholder="Search reported messages" @keydown="$event.which === 13 && searchReports()" @keyup="$event.which === 27 && clearSearch()" />
        </div>
      </div>
    </div>
    <div class="report-content fill-row centered-text" v-if="!query?.search && reportData?.count < 1">
      <h4>No Messages to display in <strong>{{query?.filter || 'All'}}</strong></h4>
    </div>
    <div class="report-content fill-row" v-if="reportData?.count > 0 || query?.search">
      <div v-if="query?.search">
      Displaying {{reportData?.count}} search result(s) for "<strong>{{query?.search}}</strong>" in <strong>{{query?.filter || 'All'}}</strong>:<br /><br />
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
          <tr v-for="report in reportData.data" :key="report.id" class="selectable-row" :class="{ 'active-row' : selectedReport?.id === report.id }" @click="selectReport(report)">
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
              <button class="icon" data-balloon="Manage Bans" @click.stop.prevent="showManageBans({ id: report.offender_author_id, username: report.offender_author_username, email: report.offender_author_email, created_at: report.offender_author_created_at, ban_expiration: report.offender_ban_expiration })">
                <i class="fa fa-ban"></i>
              </button>
              <button class="icon" data-balloon="Warn User" @click.stop.prevent="showWarn({ id: report.offender_author_id, username: report.offender_author_username })">
                <i class="fas fa-exclamation-circle"></i>
              </button>
              <div class="status-wrap">
                <button class="icon pending" :disabled="!canUpdateReport()" @click.stop.prevent="setStatus(report, 'Pending')">
                  <i v-if="report.status === 'Pending'" class="fas fa-circle"></i>
                  <i v-if="report.status !== 'Pending'" class="far fa-circle"></i>
                  Pending
                </button>
                <button class="icon reviewed" :disabled="!canUpdateReport()" @click.stop.prevent="setStatus(report, 'Reviewed')">
                  <i v-if="report.status === 'Reviewed'" class="fas fa-circle"></i>
                  <i v-if="report.status !== 'Reviewed'" class="far fa-circle"></i>
                  Reviewed
                </button>
                <button class="icon ignored" :disabled="!canUpdateReport()" @click.stop.prevent="setStatus(report, 'Ignored')">
                  <i v-if="report.status === 'Ignored'" class="fas fa-circle"></i>
                  <i v-if="report.status !== 'Ignored'" class="far fa-circle"></i>
                  Ignored
                </button>
                <button class="icon bad-report" :disabled="!canUpdateReport()" @click.stop.prevent="setStatus(report, 'Bad Report')">
                  <i v-if="report.status === 'Bad Report'" class="fas fa-circle"></i>
                  <i v-if="report.status !== 'Bad Report'" class="far fa-circle"></i>
                  Bad Report
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination-wrap">
        <simple-pagination
          v-model="reportData.page"
          :pages="reportData.page_count"
          :range-size="1"
          @update:modelValue="pageResults"
        />
      </div>
    </div>

    <!-- Report Viewer -->
    <div class="report-content report-details" v-if="selectedReport !== null">
      <div class="report-details-wrap">
        <h5 class="thin-underline">Report Details</h5>
        <table width="100%" class="report-details">
          <tbody>
            <tr>
              <td class="field">Actions</td>
              <td class="desc">
              <!-- Modify Report -->
              <button class="icon pending" data-balloon="Pending" :disabled="!canUpdateReport()" @click.stop.prevent="setStatus(selectedReport, 'Pending')">
                <i v-if="selectedReport.status === 'Pending'" class="fas fa-circle"></i>
                <i v-if="selectedReport.status !== 'Pending'" class="far fa-circle"></i>
              </button>
              <button class="icon reviewed" data-balloon="Reviewed" :disabled="!canUpdateReport()" @click.stop.prevent="setStatus(selectedReport, 'Reviewed')">
                <i v-if="selectedReport.status === 'Reviewed'" class="fas fa-circle"></i>
                <i v-if="selectedReport.status !== 'Reviewed'" class="far fa-circle"></i>
              </button>
              <button class="icon ignored" data-balloon="Ignored" :disabled="!canUpdateReport()" @click.stop.prevent="setStatus(selectedReport, 'Ignored')">
                <i v-if="selectedReport.status === 'Ignored'" class="fas fa-circle"></i>
                <i v-if="selectedReport.status !== 'Ignored'" class="far fa-circle"></i>
              </button>
              <button class="icon bad-report" data-balloon="Bad Report" :disabled="!canUpdateReport()" @click.stop.prevent="setStatus(selectedReport, 'Bad Report')">
                <i v-if="selectedReport.status === 'Bad Report'" class="fas fa-circle"></i>
                <i v-if="selectedReport.status !== 'Bad Report'" class="far fa-circle"></i>
              </button>

              <button class="icon" data-balloon="Purge Message" @click="showConfirmPurgeModal = true" :disabled="!canDeleteMessage()"><i class="fa fa-trash"></i></button>

              <!-- Warn User -->
              <button class="icon" data-balloon="Warn User" @click="showWarn({ id: selectedReport.offender_author_id, username: selectedReport.offender_author_username })" :disabled="!canCreateConversation()"><i class="fa fa-exclamation-circle"></i></button>

              <!-- Ban User -->
              <button class="icon" data-balloon="Manage Bans" @click.stop.prevent="showManageBans({ id: selectedReport.offender_author_id, username: selectedReport.offender_author_username, email: selectedReport.offender_author_email, created_at: selectedReport.offender_author_created_at, ban_expiration: selectedReport.offender_ban_expiration })" :disabled="!canBanUser()"><i class="fa fa-ban"></i></button>
              </td>
            </tr>
            <tr>
              <td class="field">Reported Date</td>
              <td class="desc" v-html="humanDate(selectedReport.created_at)"></td>
            </tr>
            <tr v-if="selectedReport.reviewer_user_id">
              <td class="field">Reviewed Date</td>
              <td class="desc" v-html="humanDate(selectedReport.updated_at)"></td>
            </tr>
            <tr>
              <td class="field">Current Status</td>
              <td class="desc" v-html="selectedReport.status"></td>
            </tr>
            <tr>
              <td class="field">Reported By</td>
              <td class="desc">
                <router-link :to="{ path: '/profile/' + selectedReport.reporter_username.toLowerCase() }" v-html="selectedReport.reporter_username" />
              </td>
            </tr>
            <tr>
              <td class="field">Reason for Report</td>
              <td class="desc">{{selectedReport.reporter_reason}}</td>
            </tr>
            <tr>
              <td class="field">Reported Message Author</td>
              <td class="desc">
                <router-link :to="{ path: '/profile/' + selectedReport.offender_author_username.toLowerCase() }" v-html="selectedReport.offender_author_username" />
              </td>
            </tr>
            <tr>
              <td class="field">Reported Message Sent Date</td>
              <td class="desc" v-html="humanDate(selectedReport.offender_created_at)"></td>
            </tr>
            <tr>
              <td class="field">Moderation Notes</td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <form name="$parent.form" class="css-form">
          <textarea name="reportNote" v-model="reportNote" :disabled="noteSubmitted" placeholder="Leave a note on this report..." rows="3" required maxlength="255"></textarea>
          <div class="clear">
            <button class="full-width" @click="submitReportNote()"
              :disabled="noteSubmitted || !reportNote || reportNote?.length < 1">Add Note</button>
          </div>
        </form>
        <div v-for="note in noteData?.data" :key="note?.id">
          <div class="note-avatar-container" v-if="!note.edit">
            <img class="note-avatar" :class="defaultAvatarShape" :src="note.avatar || defaultAvatar" />
          </div>
          <div class="note-details" v-if="!note.edit">
            <span class="note-author">
              <router-link :to="{ path: '/profile/' + note.username.toLowerCase() }" v-html="note.username" />&nbsp;</span>
            <span class="note-date" v-html="humanDate(note.created_at)"></span>
            <span class="note-date" v-if="note.created_at !== note.updated_at"> &mdash; Edited <span v-html="humanDate(note.updated_at)"></span></span>
            <span class="right" v-if="authedUser.id === note.user_id"><a href="#" @click.prevent="note.edit = true; note.noteCopy = note.note">Edit</a></span>
            <div class="note-message">{{note.note}}</div>
          </div>
          <div v-if="note.edit" class="note-details">
            <a class="right" href="#" @click.prevent="updateReportNote(note)">Save</a>
            <a class="right" href="#" @click.prevent="note.edit = undefined; note.note = note.noteCopy; note.noteCopy = undefined">Cancel&nbsp;&nbsp;&nbsp;</a>
            <textarea rows="3" v-model="note.note" maxlength="255"></textarea>
          </div>
          <div class="thin-underline"></div>
        </div>
        <div class="pagination-slide" v-if="noteData?.count">
          <div class="prev">
            <button @click="pageReportNotes(-1)" :disabled="noteData?.page <= 1">&#10094;</button>
          </div>
          <div class="page">{{noteData?.page}} of {{noteData?.page_count}}</div>
          <div class="next">
            <button @click="pageReportNotes(1)" :disabled="noteData?.page >= noteData?.page_count">&#10095;</button>
          </div>
        </div>
      </div>

      <!-- Message Body Section -->
      <div class="preview-wrap">
        <h5 class="thin-underline">Reported Message</h5>
        <!-- Message Body -->
        <!-- TODO(akinsey): <div class="post-body" post-processing="ModerationCtrl.previewReport.offender_message" style-fix="true"></div> -->
        <div v-html="selectedReport.offender_message"></div>
      </div>
    </div>

  </div>

  <manage-bans-modal :user="selectedUser" :show="showManageBansModal" @close="showManageBansModal = false" @success="refreshPageData" />
  <quick-message-modal v-if="selectedUser" :user="selectedUser" :show="showWarnModal" @close="showWarnModal = false" />
  <confirm-modal :show="showConfirmPurgeModal" @close="showConfirmPurgeModal = false" @confirmed="purgeMessage" modal-title="Confirm Purge Message"  modal-description="Are you sure you want to purge this message? This will permanently delete the message from the sender and receiver's inbox." />
</template>

<script>
import { reactive, toRefs, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminApi, messagesApi } from '@/api'
import SimplePagination from '@/components/layout/SimplePagination.vue'
import humanDate from '@/composables/filters/humanDate'
import { AuthStore } from '@/composables/stores/auth'
import QuickMessageModal from '@/components/modals/profile/QuickMessage.vue'
import ManageBansModal from '@/components/modals/profile/ManageBans.vue'
import ConfirmModal from '@/components/modals/common/Confirm.vue'

export default {
  name: 'MessageModeration',
  components: { SimplePagination, ManageBansModal, QuickMessageModal, ConfirmModal },
  beforeRouteEnter(to, from, next) {
    let queryParams = {
      limit: Number(to.query.limit) || undefined,
      page: Number(to.query.page) || undefined,
      filter: to.query.filter,
      field: to.query.field,
      desc: to.query.desc ? false : true,
      search: to.query.search
    }
    if (to.query.reportId) {
      let reportData
      adminApi.reports.pageMessageReports(queryParams)
      .then(data => {
        reportData = data
        return adminApi.reports.pageMessageNotes(to.query.reportId)
      })
      .then(data => next(vm => {
        vm.reportData = reportData
        vm.noteData = data
        vm.initSelectedReport(to.query.reportId, reportData.data)
        vm.query = queryParams
      }))
    }
    else {
     adminApi.reports.pageMessageReports(queryParams).then(data => next(vm => {
       vm.reportData = data
       vm.query = queryParams
     }))
    }
  },
  beforeRouteUpdate(to, from, next) {
    let queryParams = {
      limit: Number(to.query.limit) || undefined,
      page: Number(to.query.page) || undefined,
      filter: to.query.filter,
      field: to.query.field,
      desc: to.query.desc ? false : true,
      search: to.query.search
    }
    if (to.query.reportId) {
      let reportData
      adminApi.reports.pageMessageReports(queryParams)
      .then(data => {
        reportData = data
        return adminApi.reports.pageMessageNotes(to.query.reportId)
      })
      .then(data => {
        this.reportData = reportData
        this.noteData = data
        this.initSelectedReport(to.query.reportId, reportData.data)
        this.query = queryParams
        next()
      })
    }
    else {
     adminApi.reports.pageMessageReports(queryParams).then(data => {
       this.reportData = data
       this.query = queryParams
       next()
     })
    }
  },
  setup() {
    const refreshPageData = () => {
      let queryParams = {
        limit: Number($route.query.limit) || undefined,
        page: Number($route.query.page) || undefined,
        filter: $route.query.filter,
        field: $route.query.field,
        desc: $route.query.desc ? false : true,
        search: $route.query.search
      }
      if ($route.query.reportId) {
        adminApi.reports.pageMessageReports(queryParams)
        .then(data => {
          v.reportData = data
          return adminApi.reports.pageMessageNotes($route.query.reportId)
        })
        .then(data => {
          v.noteData = data
          initSelectedReport($route.query.reportId, v.reportData.data)
          v.query = queryParams
        })
      }
      else {
       adminApi.reports.pageMessageReports(queryParams).then(data => {
         v.reportData = data
         v.query = queryParams
       })
      }
    }

    const initSelectedReport = (reportId, reports) => reports.forEach(r => reportId === r.id ? v.selectedReport = r : null)

    const pageReportNotes = inc => {
      let page = v.noteData.page + inc
      adminApi.reports.pageMessageNotes(v.selectedReport.id, { page })
      .then(d => v.noteData = d)
      .then(() => window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight))
    }

    const setFilter = filter => {
      let query = { filter: filter }
      delete query.search
      v.searchStr = ''
      const params = { ...$route.params, saveScrollPos: true }
      v.selectedReport = null
      $router.replace({ name: $route.name, params, query: query })
    }
    const clearSearch = () => {
      let query = { ...$route.query }
      delete query.page
      delete query.search
      v.searchStr = ''
      v.selectedReport = null
      const params = { ...$route.params, saveScrollPos: true }
      $router.replace({ name: $route.name, params, query: query })
    }
    const searchReports = () => {
      let query = { ...$route.query, search: v.searchStr }
      delete query.page
      v.selectedReport = null
      const params = { ...$route.params, saveScrollPos: true }
      $router.replace({ name: $route.name, params, query: query })
    }
    const pageResults = page => {
      let query = { ...$route.query, page: page }
      if (query.page <= 1 || !query.page) delete query.page
      $router.replace({ name: $route.name, params: $route.params, query: query })
    }
    const selectReport = report => {
      let query = { ...$route.query }
      if (v.selectedReport?.id === report.id) {
        v.selectedReport = null
        delete query.reportId
      }
      else {
        v.selectedReport = report
        query.reportId = v.selectedReport.id
        adminApi.reports.pageMessageNotes(query.reportId).then(data => v.noteData = data)
      }
      let qs = ''
      Object.keys(query).forEach(k => qs += qs.length ? `&${k}=${query[k]}` : `?${k}=${query[k]}`)
      window.history.replaceState(window.history.state, null, qs)
    }
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
      let query = { limit: $route.query.limit, field: newField, filter: $route.query.filter, page: $route.query.page, search: v.searchStr }
      if (!query.page) delete query.page // don't include page if undefined
      if (!query.search) delete query.search // don't include search if undefined
      if (newField === 'created_at') delete query.field // do not display default field in qs
      if (desc) query.desc = true // do not display desc if false
      const params = { ...$route.params, saveScrollPos: true } // save scroll pos when sorting table
      $router.replace({ name: $route.name, params: params, query: query })
    }

    const getSortClass = field => {
      let sortClass = 'fa '
      const desc = v.query?.desc
      const curField = v.query?.field
      const defaultField = field === 'created_at' && !curField
      if ((defaultField || curField === field) && desc) sortClass += 'fa-sort-down'
      else if ((defaultField || curField === field) && !desc) sortClass += 'fa-sort-up'
      else sortClass += 'fa-sort'
      return sortClass
    }

    const setStatus = (report, status) => {
      if (report.status === status) return
      let updatedReport = {
        id: report.id,
        reviewer_user_id: v.authedUser.id,
        status: status
      }
      adminApi.reports.updateMessageReport(updatedReport)
      .then(data => {
        report.reviewer_user_id = data.reviewer_user_id
        report.status = data.status
        report.updated_at = data.updated_at
        $alertStore.success('Report status has been set to ' + status)
      })

    }

    const canUpdateReport = () => v.loggedIn && v.permUtils.hasPermission('reports.updateMessageReport.allow')
    const canCreateConversation = () => v.loggedIn && v.permUtils.hasPermission('conversations.create.allow')
    const canBanUser = () => v.loggedIn && (v.permUtils.hasPermission('bans.ban.allow') || v.permUtils.hasPermission('bans.banFromBoards.allow'))
    const canDeleteMessage = () => v.loggedIn && v.permUtils.hasPermission('messages.delete.allow')

    const showWarn = user => {
      v.selectedUser = user
      v.showWarnModal = true
    }
    const showManageBans = user => {
      v.selectedUser = user
      // ban_expiration must not be set if the user isnt globally banned
      if (!v.selectedUser.ban_expiration) delete v.selectedUser.ban_expiration
      v.showManageBansModal = true
    }
    const purgeMessage = () => messagesApi.delete(v.selectedReport.offender_message_id)
      .then(() => $alertStore.success('Successfully purged the reported message.'))
      .catch(() => $alertStore.error('There was an error purging the reported message.'))

    const updateReportNote = note => {
      delete note.edit
      note.report_id = v.selectedReport.id
      adminApi.reports.updateMessageNote(note)
      .then(updatedNote => {
        for (var i = 0; i < v.noteData.data.length; i++) {
          if (v.noteData.data[i].id === note.id) {
            v.noteData.data[i] = updatedNote
            break
          }
        }
        $alertStore.success('Note successfully updated')
      })
      .catch(err => {
        note.note = note.noteCopy
        delete note.noteCopy
        $alertStore.error('Error: ' + err.data.message)
      })
    }

    const submitReportNote = () => {
      v.noteSubmitted = true;
      let params = {
        report_id: v.selectedReport.id,
        user_id: v.authedUser.id,
        note: v.reportNote
      }
      adminApi.reports.createMessageNote(params)
      .then(() => {
        v.noteSubmitted = false
        v.reportNote = null
        $alertStore.success('Note successfully created')
        return adminApi.reports.pageMessageNotes(v.selectedReport.id, { page: 1 })
      })
      .then(d => v.noteData = d)
    }

    const $route = useRoute()
    const $router = useRouter()
    const $auth = inject(AuthStore)
    const $alertStore = inject('$alertStore')

    const v = reactive({
      loggedIn: $auth.loggedIn,
      authedUser: $auth.user,
      permUtils: $auth.permissionUtils,
      query: {},
      reportData: {},
      noteData: {},
      selectedReport: null,
      searchStr: null,
      reportNote: null,
      noteSubmitted: false,
      showManageBansModal: false,
      showConfirmPurgeModal: false,
      showWarnModal: false,
      selectedUser: {},
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape
    })

    return { ...toRefs(v), setFilter, searchReports, clearSearch, setSortField, getSortClass, humanDate, pageResults, selectReport, setStatus, canUpdateReport, canCreateConversation, canDeleteMessage, canBanUser, showWarn, showManageBans, updateReportNote, submitReportNote, initSelectedReport, pageReportNotes, refreshPageData, purgeMessage }
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

.report-content {
  margin-top: 6rem;

  &.report-details {
    display: grid;
    grid-template-columns: 3fr 7fr;
    grid-template-areas: "details preview";
    grid-gap: 1rem;
    margin-top: 4rem;
    .report-details-wrap { grid-area: details; }
    .preview-wrap { grid-area: preview; }
    .note-avatar-container {
      float: left;
      width: 3.75rem;
      height: 3.75rem;
      .note-avatar.circle { border-radius: 100%; object-fit: cover; width: 3.125rem; height: 3.125rem; }
      .note-avatar.rect { width: 3.125rem; height: 3.125rem; }
    }
    .note-details {
      font-size: 13px;
      padding-top: 5px;
      padding-bottom: 5px;
      .note-date { color: $secondary-font-color; }
    }
    form { margin-bottom: 1rem; }
    .pagination-slide {
      display: flex;
      width: 100%;
      flex-direction: row;
      column-gap: 1rem;
      align-items: stretch;
      margin-bottom: .5rem;
      .prev, .next {
        flex: 0;
        line-height: 2.25rem;
        button { width: 7rem; float: right; }
      }
      .page {
        flex: 1;
        line-height: 2.25rem;
        text-align: center;
      }
    }
  }
}
button.icon { display: inline-block; }
table.underlined {
  border: none;
  margin-bottom: 1rem;
  thead {
    text-align: left;
    font-size: 0.875rem;
    background-color: transparent;
    border-bottom: $border-alt;
    th { color: $secondary-font-color; font-weight: 400; padding-bottom: 0.5rem; padding-left: 0.5rem; }
    .user-actions { text-align: right; padding-right: 1rem; }
  }
  tr {
    border-bottom: 1px solid $border-color-alt;
    vertical-align: top;
    &.selectable-row { @include no-select; cursor: pointer; }
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
      padding-right: 0.5rem;
      vertical-align: top;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding-right: 0.5rem;
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
      font-size: 0.75rem;

      &:last-child {
        padding-right: 0;
      }
    }

    td input { margin-bottom: 0; }
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    .status-wrap .icon {
      &.ignored, &.pending, &.reviewed, &.bad-report {
        padding: .1rem .25rem;
        border-radius: 3px;
        background: $sub-header-color;
        font-size: .75rem;
        border: 1px solid darken($color-primary-alt, 10%);
      }
    }
  }
}
.icon {
  &.ignored i { color: #FD8D40; }
  &.pending i { color: #49AED0; }
  &.reviewed i { color: #43AC6A; }
  &.bad-report i { color: #E65239; }
}
table.report-details {
  tr:first-child td { padding-top: 0; }
  td.field {
    font-size: 0.8125rem;
    color: $secondary-font-color;
    width: 9.375rem;
    padding-left: 0;
    vertical-align: top;
    padding-right: 0.5rem;
  }
  td.desc {
    font-size: 0.875rem;
    .note {
      font-size: 0.65rem;
      color: $secondary-font-color;
      margin-top: 0.25rem;
    }
  }
}
</style>
