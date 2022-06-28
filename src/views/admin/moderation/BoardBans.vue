<template>
  <div class="full-width">
    <div class="admin-table-header row">
      <div class="column">
        <select name="boards" v-model="boardFilter" @change="filterBoards()" class="boards-select">
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

    const v = reactive({
      boardsMovelist: {},
      boardFilter: null,
      searchStr: null,
      boardBanData: {}
    })

    return { ...toRefs(v), decode, filterBoards, searchBannedUsers, clearSearch }
  }
}
</script>

<style lang="scss">
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
</style>
