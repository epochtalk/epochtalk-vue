<template>
  <div class="full-width">
    <div class="admin-table-header row">
      <div class="column">
        <select name="boards" v-model="boardFilter" @change="filterBoards()" class="boards-select">
          <option :value="null">Filter by All Boards</option>
          <optgroup v-for="(boards, parentName) in boardsMovelist" :label="parentName" :key="parentName">
            <option v-for="board in boards" :value="board" :key="decode(board.name)">{{decode(board.name)}}</option>
          </optgroup>
        </select>
      </div>
      <div class="column">
        <div class="nested-input-container">
          <a v-if="boardBanData?.search" @click="clearSearch()" class="nested-clear-btn fa fa-times"></a>
          <a @click="searchBannedUsers()" class="nested-btn">Search</a>
          <input class="input-text nested-input" v-model="searchStr" type="text" id="search-users" placeholder="Search Banned Users" @keydown="$event.which === 13 && searchBannedUsers()" @keyup="$event.which === 27 && clearSearch()" />
        </div>
      </div>
    </div>
    <div class="board-ban-content">
      <table class="underlined" width="100%">
        <thead>
          <th class="left-icon-col"></th>
          <th>User</th>
          <th>Email</th>
          <th>Banned Boards</th>
          <th>Action</th>
        </thead>
        <tbody v-if="boardBanData?.data?.length">
          <tr v-for="boardBan in boardBanData?.data" :key="boardBan">
            <td class="left-icon-col">
              <i v-if="bannedFromModeratedBoard(boardBan.board_ids)" class="far fa-star"></i>
            </td>
            <td>
              <router-link :to="{ path: '/profile/' + boardBan.username.toLowerCase() }" v-html="boardBan.username" />
            </td>
            <td><a :href="`mailto:${boardBan.email}`" target="_blank" v-html="boardBan.email"></a></td>
            <td>
              <span v-for="(boardName, i) in boardBan.board_names" :key="i">
                <router-link :to="{ path: '/boards/' + boardBan.board_slugs[i] }" v-html="boardName + (i < boardBan.board_names.length - 1 ? ', ' : '') "></router-link>
              </span>
            </td>
            <td>
              <a class="pointer" @click="showManageBans(boardBan)"><i class="fas fa-ban"></i></a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="row">
      <div class="column">
        <div class="indicator"><i class="far fa-star"></i> Indicates a user that has been banned from a board you moderate</div>
      </div>
      <div class="column">
        <div class="pagination-wrap" v-if="boardBanData?.page > 1 || boardBanData.next">
          <div class="pagination-simple">
            <button @click="pageResults(boardBanData.prev)" :disabled="!boardBanData.prev">&#10094; Prev</button>
            <button @click="pageResults(boardBanData.next)" :disabled="!boardBanData.next">Next &#10095;</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { adminApi, boardsApi } from '@/api'
import { groupBy } from 'lodash'
import decode from '@/composables/filters/decode'

export default {
  name: 'BoardBanModeration',
  beforeRouteEnter(to, from, next) {
    let queryParams = {
      page: to.query.page || undefined,
      limits: to.query.limit || undefined,
      modded: to.query.modded,
      board: to.query.board,
      search: to.query.search
    }
    adminApi.bans.pageByBannedBoards(queryParams)
    .then(data => {
      boardsApi.movelist()
      // create options groups by parent name
      .then(ml => groupBy(ml, 'parent_name'))
      .then(movelist => next(vm => {
        vm.boardBanData = data
        vm.boardsMovelist = movelist
        vm.searchStr = to.query.search
      }))
    })
  },
  beforeRouteUpdate(to, from, next) {
    let queryParams = {
      page: to.query.page || undefined,
      limits: to.query.limit || undefined,
      modded: to.query.modded,
      board: to.query.board,
      search: to.query.search
    }
    adminApi.bans.pageByBannedBoards(queryParams)
    .then(data => {
      boardsApi.movelist()
      // create options groups by parent name
      .then(ml => groupBy(ml, 'parent_name'))
      .then(movelist => {
        this.boardBanData = data
        this.boardsMovelist = movelist
        this.searchStr = to.query.search
        next()
      })
    })
  },
  setup() {
    const filterBoards = () => {
      console.log(v.boardFilter)
    }

    const searchBannedUsers = () => console.log(v.searchStr)
    const clearSearch = () => console.log('clearSearch')
    const showManageBans = data => console.log(data)
    const bannedFromModeratedBoard = () => true

    const v = reactive({
      boardsMovelist: {},
      boardFilter: null,
      searchStr: null,
      boardBanData: {}
    })

    return { ...toRefs(v), decode, filterBoards, searchBannedUsers, clearSearch, showManageBans, bannedFromModeratedBoard }
  }
}
</script>

<style lang="scss">
.board-ban-content { margin-top: 6rem; }
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
.column { flex: 50%; }
.nested-btn { margin-bottom: 1rem; }

th.left-icon-col { width: 1.5rem; }
td.left-icon-col {
  pading: 0 0 0 0.5rem;
  color: $secondary-font-color;
  padding-top: 0.5rem;
}

.indicator {
  font-size: 0.75rem;
  margin-left: 0.5rem;
  color: $secondary-font-color;
  i { padding: 0 0.5rem 0 0; }
}
</style>
