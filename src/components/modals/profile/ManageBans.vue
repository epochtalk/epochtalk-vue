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
            <td>Global Ban Expiration</td>
            <td>{{ humanDate(userCopy.ban_expiration, true) }}</td>
          </tr>
          <tr v-if="userCopy.banned_board_names.length">
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
            <a class="right" @click="permanentBan = undefined; banUntil = undefined;" v-if="permanentBan !== undefined">
              <i class="fa fa-times"></i> Remove Global Ban
            </a>
          </label>
          <input type="radio" name="banType" v-model="permanentBan" :value="true" id="permanent" :disabled="banSubmitted"><label for="permanent">Permanent</label>
          <input type="radio" name="banType" v-model="permanentBan" :value="false" id="temporary" :disabled="banSubmitted"><label for="temporary">Temporary</label>

          <div v-if="permanentBan === false">
            <label for="banUntil">Enter Ban Expiration Date:</label>
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
        <label v-if="errorMessage" class="red centered-text">{{errorMessage}}</label>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, inject, onBeforeMount, onBeforeUpdate } from 'vue'
import { cloneDeep } from 'lodash'
import { boardsApi, banApi } from '@/api'
import humanDate from '@/composables/filters/humanDate'
import moment from 'moment'
import IgnoredBoardsPartial from '@/components/settings/IgnoredBoardsPartial.vue'
import { AuthStore } from '@/composables/stores/auth'

export default {
  name: 'manage-bans-modal',
  props: ['show', 'user', 'disableBoardBans'],
  emits: ['close'],
  components: { Modal, IgnoredBoardsPartial },
  setup(props, { emit }) {
    onBeforeMount(() => props.disableBoardBans ? null : initBoardData())
    onBeforeUpdate(() => props.disableBoardBans ? null : initBoardData())

    const initBoardData = () => {
      boardsApi.getBoards(true)
      .then(d => v.boards = d.boards)
      .then(initDisabledBoards)
      .catch(() => {})
      banApi.getBannedBoards(props.user.username)
      .then(initBanInfo).catch(() => {})
    }

    const initDisabledBoards = () => {
      // Admins can ban from all boards
      if (v.authedIsAdmin) return
      // User is not admin, disable all boards checkmarks initially
      v.disabledInputs = genBoardsObjFromArray(v.boards, {}, true)
      // Re-enable only the checkmarks for boards this user moderates
      v.authedUser.moderating.forEach(bid => delete v.disabledInputs[bid])
    }

    const initBanInfo = bannedBoards => {
      v.checkedBoardInputs = bannedBoards.reduce((acc, b) => {
        acc[b.id] = true
        return acc
      }, {})
      v.userCopy = {
        ...cloneDeep(props.user),
        banned_board_names: bannedBoards.map(b => b.name),
        banned_board_ids: [ ...bannedBoards ]
      }
      const maxDate = new Date(8640000000000000)
      const banDate = new Date(props.user.ban_expiration)
      // Preselect Global Ban Type radio button if the user is banned
      v.permanentBan = props.user.ban_expiration ? banDate.getTime() === maxDate.getTime() : undefined
      v.showIpBan = v.permanentBan ? false : true
      v.banUntil = v.permanentBan ? undefined : moment(banDate).format('YYYY-MM-DD')
      v.userCopy.permanent_ban = v.banUntil ? false : true
    }

    /* Template Methods */
    const updateBan = () => {
      v.errorMessage = null
      $alertStore.info('TODO: Update Ban')
      close()
    }

    const checkAll = checked => v.authedIsAdmin ? v.checkedBoardInputs = genBoardsObjFromArray(v.boards, {}, checked) : v.authedUser.moderating.forEach(bid => v.checkedBoardInputs[bid] = checked)


    const genBoardsObjFromArray = (boards, checkedBoardInputs, checked) => {
      if (!boards || !boards.length) return checkedBoardInputs
      for (let i = 0; i < boards.length; i++) {
        const curBoard = boards[i]
        checkedBoardInputs = genBoardsObjFromArray(curBoard.boards || curBoard.children || [], checkedBoardInputs, checked)
        if (curBoard.category_id || curBoard.parent_id) checkedBoardInputs[curBoard.id] = checked
      }
      return checkedBoardInputs
    }

    const toggleIgnoredBoard = boardId => v.checkedBoardInputs[boardId] ? delete v.checkedBoardInputs[boardId] : v.checkedBoardInputs[boardId] = true

    const canGlobalBanUser = () => v.permUtils.hasPermission('bans.ban.allow')

    const minDate = () => {
      var d = new Date()
      var month = '' + (d.getMonth() + 1)
      var day = '' + d.getDate()
      var year = d.getFullYear()
      if (month.length < 2) month = '0' + month
      if (day.length < 2) day = '0' + day
      return [year, month, day].join('-')
    }

    const close = () => {
      v.errorMessage = null
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')
    const $auth = inject(AuthStore)

    /* Template Data */
    const v = reactive({
      authedUser: $auth.user,
      userCopy: null,
      userReactive: props.user,
      permUtils: $auth.permissionUtils,
      authedIsAdmin: $auth.permissionUtils.hasPermission('bans.banFromBoards.bypass.type.admin'),
      focusInput: null,
      errorMessage: '',
      permanentBan: null,
      showIpBan: true,
      boards: null,
      checkedBoardInputs: [],
      disabledInputs: {},
      banUserIp: null,
      banUntil: null,
      banSubmitted: false
    })

    return { ...toRefs(v), minDate, updateBan, canGlobalBanUser, toggleIgnoredBoard, checkAll, humanDate, close }
  }
}
</script>
