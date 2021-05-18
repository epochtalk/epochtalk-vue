<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Manage Bans</template>

    <template v-slot:body>
      <form v-if="userCopy" action="." class="css-form">
        <!-- Manage Bans -->
        <label class="bold">User Information</label>
        <table class="striped" width="100%">
          <tr>
            <td>Username</td>
            <td>{{ userCopy.username }}</td>
          </tr>
          <tr>
            <td>Email</td>
            <td>{{ userCopy.email }}</td>
          </tr>
          <tr>
            <td>Register Date</td>
            <td>{{ humanDate(userCopy.created_at) }}</td>
          </tr>
          <tr v-if="userCopy.ban_expiration">
            <td>Global Ban Expiration (UTC)</td>
            <td>{{ humanDate(dayjs.utc(userCopy.ban_expiration), true) }}</td>
          </tr>
          <tr v-if="userCopy?.banned_board_names?.length">
            <td>Banned From Boards</td>
            <td>
              <span v-for="(boardName, i) in userCopy.banned_board_names" :key="i">
                {{ boardName }}<span v-if="(i + 1) !== userCopy.banned_board_names.length">, </span>
              </span>
            </td>
          </tr>
        </table>

        <div v-if="canGlobalBanUser()">
          <label for="banType">
            <strong>Ban Globally</strong>
            <a class="right" @click="permanentBan = undefined; banUntil = undefined;" v-if="permanentBan === true || permanentBan === false">
              <i class="fa fa-times"></i> Remove Global Ban
            </a>
          </label>
          <input type="radio" name="banType" v-model="permanentBan" :value="true" id="permanent" :disabled="banSubmitted"><label for="permanent">Permanent</label>
          <input type="radio" name="banType" v-model="permanentBan" :value="false" id="temporary" :disabled="banSubmitted"><label for="temporary">Temporary</label>

          <div v-if="permanentBan === false">
            <label for="banUntil">Enter Ban Expiration Date (UTC):</label>
            <input type="date" v-model="banUntil" :min="minDate()" name="banUntil" :required="permanentBan === false" />
          </div>

          <div v-if="showIpBan && permanentBan === true">
            <input type="checkbox" v-model="banUserIp" :disabled="banSubmitted" name="ipBan" id="ipBan" /><label for="ipBan">Ban all of {{userCopy.username}}'s known IP addresses</label>
          </div>
        </div>

        <div class="board-bans-list" v-if="!disableBoardBans">
          <label>
            <strong>Ban from my Boards</strong>
            <div class="right">
              <a @click="checkAll(true)"><i class="far fa-check-square"></i> Check All</a>
              &nbsp;&nbsp;
              <a @click="checkAll(false)"><i class="far fa-square"></i> Uncheck All</a>
            </div>
          </label>
          <div class="clear boards-check-list">
            <div v-for="cat in boards" :key="cat.id">
              <label v-if="cat.boards.length" class="bold">{{cat.name}}</label>
              <ul>
                <li v-for="board in cat.boards" :key="board.id">
                  <ignored-boards-partial @toggle-ignored-board="toggleIgnoredBoard" :current-board="board" :checked-inputs="checkedBoardInputs" :disabled-inputs="disabledInputs" />
                </li>
              </ul>
            </div>
          </div>
        </div>
        <!-- Save Button -->
        <div class="modal-actions">
          <button @click.prevent="updateBan()">
            Confirm
          </button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, inject, watch } from 'vue'
import { cloneDeep, difference } from 'lodash'
import { boardsApi, banApi, usersApi } from '@/api'
import humanDate from '@/composables/filters/humanDate'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)
import IgnoredBoardsPartial from '@/components/settings/IgnoredBoardsPartial.vue'
import { AuthStore } from '@/composables/stores/auth'

export default {
  name: 'manage-bans-modal',
  props: ['show', 'user', 'disableBoardBans'],
  emits: ['close'],
  components: { Modal, IgnoredBoardsPartial },
  setup(props, { emit }) {
    watch(() => props.show, show => {
      if (show) {
        initUser()
        props.disableBoardBans ? initGlobalBanInfo() : init()
      }
    })

    const init = () => {
      boardsApi.getBoards(true)
      .then(d => v.boards = d.boards)
      .then(initDisabledBoards)
      .catch(() => {})
      banApi.getBannedBoards(props.user.username)
      .then(initBanInfo).catch(() => {})
    }

    const initUser = () => usersApi.find(props.user.username)
      .then(updatedUser => {
        Object.assign(v.userReactive, updatedUser)
        Object.assign(v.userCopy, cloneDeep(updatedUser))
      })

    const initDisabledBoards = () => {
      // Admins can ban from all boards
      if (v.authedIsAdmin) return
      // User is not admin, disable all boards checkmarks initially
      v.disabledInputs = genBoardsObjFromArray(v.boards, {}, true)
      // Re-enable only the checkmarks for boards this user moderates
      v.authedUser.moderating.forEach(bid => delete v.disabledInputs[bid])
    }

    const initGlobalBanInfo = () => {
      if (props.user.ban_expiration) { // Init data, user has temp ban
        const maxDate = new Date(8640000000000000)
        const banDate = new Date(props.user.ban_expiration)
        // Preselect Global Ban Type radio button if the user is banned
        v.permanentBan = props.user.ban_expiration ? banDate.getTime() === maxDate.getTime() : undefined
        v.showIpBan = v.permanentBan ? false : true
        v.banUntil = v.permanentBan ? undefined : dayjs.utc(banDate).format('YYYY-MM-DD')
        v.userCopy.permanent_ban = v.banUntil ? false : true
      }
      else if (props.user.ban_expiration === null) { // Init data, user has perma ban
        v.permanentBan = true
        v.userCopy.permanent_ban = true
      }
      else { // Init data, user has no ban
        v.permanentBan = undefined
        v.banUserIp = null
        v.banUntil = null
      }
    }

    const initBanInfo = bannedBoards => {
      v.checkedBoardInputs = bannedBoards.reduce((acc, b) => {
        acc[b.id] = true
        return acc
      }, {})
      v.userCopy = {
        ...v.userCopy,
        banned_board_names: bannedBoards.map(b => b.name),
        banned_board_ids: bannedBoards.map(b => b.id)
      }
      initGlobalBanInfo()
    }

    const genBoardsObjFromArray = (boards, checkedBoardInputs, checked) => {
      if (!boards || !boards.length) return checkedBoardInputs
      for (let i = 0; i < boards.length; i++) {
        const curBoard = boards[i]
        checkedBoardInputs = genBoardsObjFromArray(curBoard.boards || curBoard.children || [], checkedBoardInputs, checked)
        if (checked && curBoard.category_id || curBoard.parent_id) checkedBoardInputs[curBoard.id] = true
      }
      return checkedBoardInputs
    }

    /* Template Methods */
    const canGlobalBanUser = () => v.permUtils.hasPermission('bans.ban.allow')

    const checkAll = checked => {
      if (v.authedIsAdmin) v.checkedBoardInputs = checked ? genBoardsObjFromArray(v.boards, {}, true) : {}
      else v.authedUser.moderating.forEach(bid => checked ? v.checkedBoardInputs[bid] = true : delete v.checkedBoardInputs[bid])
    }

    const toggleIgnoredBoard = boardId => v.checkedBoardInputs[boardId] ? delete v.checkedBoardInputs[boardId] : v.checkedBoardInputs[boardId] = true

    const updateBan = () => {
      // Used to update reports in table
      let results = {
        user_id: v.userCopy.id,
        board_banned: Object.keys(v.checkedBoardInputs).length > 0
      }
      // Used for updating global bans
      let globalBanParams = {
        user_id: v.userCopy.id,
        expiration: v.permanentBan ? undefined : new Date(v.banUntil),
        ip_ban: v.permanentBan && v.banUserIp ? true : undefined
      }
      // Used for updating banned boards
      let banBoardParams = {
        user_id: v.userCopy.id,
        board_ids: difference(Object.keys(v.checkedBoardInputs), v.userCopy.banned_board_ids)
      }
      // Used for updating unbanned boards
      let unbanBoardParams = {
        user_id: v.userCopy.id,
        board_ids: difference(v.userCopy.banned_board_ids, Object.keys(v.checkedBoardInputs))
      }

      // Ban diffing variables
      const newBanIsTemp = v.permanentBan === false && v.banUntil
      const newBanIsPerm = v.userReactive.ban_expiration !== null && v.permanentBan
      const oldBanIsRemoved = v.permanentBan === undefined
      const oldBanIsTemp = v.userCopy.permanent_ban === false
      const oldBanIsPerm = v.userCopy.permanent_ban
      const userWasntBanned = v.userCopy.permanent_ban === undefined
      const dateChanged = v.banUntil !== dayjs.utc(v.userCopy.ban_expiration).format('YYYY-MM-DD')

      // Check if user wasn't banned and is now banned, or the ban type changed, or the ban date is changed
      const userBanned = (newBanIsTemp && (oldBanIsPerm || userWasntBanned)) || (newBanIsPerm && (oldBanIsTemp || userWasntBanned)) || (newBanIsTemp && oldBanIsTemp && dateChanged)
      // Check if user was banned previously and is now unbanned
      const userUnbanned = oldBanIsRemoved && (oldBanIsTemp || oldBanIsPerm)

      let promises = []
      // User is being banned globally either permanently or temporarily
      if (userBanned && canGlobalBanUser()) {
        promises.push(banApi.ban(globalBanParams)
          .then(banInfo => {
            $alertStore.success(v.userCopy.username + ' has been globally banned ' + (v.permanentBan ? 'permanently' : ' until ' + humanDate(v.banUntil, true)))
            results = banInfo
          })
          .catch(err => {
            results.banError = err
            let msg = 'There was an error globally banning ' + v.userCopy.username
            if (err.status === 403) msg = v.userCopy.username + ' has higher permissions than you, cannot globally ban'
            $alertStore.error(msg)
          })
        )
      }
      // User is being unbanned globally, ensure user is currently banned
      else if (userUnbanned && canGlobalBanUser()) {
        delete globalBanParams.expiration
        promises.push(banApi.unban(globalBanParams)
          .then(unbanInfo => {
            // reset calculated data when unbanning
            delete v.userReactive.ban_expiration
            delete v.userCopy.ban_expiration
            delete v.userReactive.permanent_ban
            delete v.userCopy.permanent_ban
            $alertStore.success(v.userCopy.username + ' has been globally unbanned');
            results = unbanInfo
          })
          .catch(err => {
            results.banError = err
            var msg = 'There was an error globally unbanning ' + v.userCopy.username
            if (err.status === 403) msg = v.userCopy.username + ' has higher permissions, cannot globally unban'
            $alertStore.error(msg)
          })
        )
      }
      // User is being banned from new boards
      if (banBoardParams.board_ids.length) {
        promises.push(banApi.banFromBoards(banBoardParams)
          .then(() => $alertStore.success(v.userCopy.username + ' has been banned from boards'))
          .catch(err => {
            results.boardBanError = err
            let msg = 'There was an error banning ' + v.userCopy.username + ' from boards'
            if (err.status === 403) msg = v.userCopy.username + ' has higher permissions, cannot ban from boards'
            $alertStore.error(msg)
          })
        );
      }
      // User is being unbanned from boards
      if (unbanBoardParams.board_ids.length) {
        promises.push(banApi.unbanFromBoards(unbanBoardParams)
          .then(() => $alertStore.success(v.userCopy.username + ' has been unbanned from boards'))
          .catch(err => {
            results.boardBanError = err
            let msg = 'There was an error unbanning ' + v.userCopy.username + ' from boards'
            if (err.status === 403) msg = v.userCopy.username + ' has higher permissions, cannot unban from boards'
            $alertStore.error(msg)
          })
        )
      }
      Promise.all(promises)
      .then(() => initUser())
      .then(() => close())
      .catch(() => close())
    }

    const minDate = () => {
      const d = new Date()
      let month = '' + (d.getMonth() + 1)
      let day = '' + d.getDate()
      const year = d.getFullYear()
      if (month.length < 2) month = '0' + month
      if (day.length < 2) day = '0' + day
      return [year, month, day].join('-')
    }

    const close = () => emit('close')

    /* Internal Data */
    const $alertStore = inject('$alertStore')
    const $auth = inject(AuthStore)

    /* Template Data */
    const v = reactive({
      authedUser: $auth.user,
      userCopy: cloneDeep(props.user),
      userReactive: props.user,
      permUtils: $auth.permissionUtils,
      authedIsAdmin: $auth.permissionUtils.hasPermission('bans.banFromBoards.bypass.type.admin'),
      focusInput: null,
      permanentBan: null,
      showIpBan: true,
      boards: null,
      checkedBoardInputs: [],
      disabledInputs: {},
      banUserIp: null,
      banUntil: null,
      banSubmitted: false
    })

    return { ...toRefs(v), minDate, updateBan, canGlobalBanUser, toggleIgnoredBoard, checkAll, humanDate, close, dayjs }
  }
}
</script>
